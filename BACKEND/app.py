import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv
from bson.objectid import ObjectId
from flask_mail import Mail, Message
import math 
from google.oauth2 import id_token
from google.auth.transport import requests  
from google.auth.transport import requests as grequests


dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    print("Warning: .env file not found.")

app = Flask(__name__)

# Get the MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY")

# Check if the MONGO_URI is set
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set in the environment variables.")

app.config["MONGO_URI"] = MONGO_URI
app.config["SECRET_KEY"] = SECRET_KEY
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 465))
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'false').lower() in ['true', '1']
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'true').lower() in ['true', '1']

# --- INITIALIZE EXTENSIONS ---
try:
    mongo = PyMongo(app)
    # Check if the connection is successful by trying to access a collection
    # This will raise an exception if the connection fails
    mongo.db.list_collection_names() 
    print("MongoDB connection successful.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    mongo = None # Ensure mongo is None if connection fails

# --- INITIALIZE EXTENSIONS ---
# mongo = PyMongo(app)
bcrypt = Bcrypt(app)
CORS(app) # Enable Cross-Origin Resource Sharing
mail = Mail(app)

GOOGLE_CLIENT_ID = "305274803308-k2emdcf4q5m7547r4qc1tb758qmpb7l5.apps.googleusercontent.com"


alerts_sent_for_user = {}

# --- A WRAPPER/DECORATOR FOR PROTECTED ROUTES ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1] # Bearer <token>

        if not token:
            return jsonify({'message': 'Authentication token is missing!'}), 401

        try:
            # Decode the token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Find the user
            current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
            # Convert ObjectId to string for JSON serialization
            current_user['_id'] = str(current_user['_id'])
        except Exception as e:
            return jsonify({'message': 'Token is invalid or expired!', 'error': str(e)}), 401
        
        # Pass the current user to the route
        return f(current_user, *args, **kwargs)

    return decorated

def haversine_distance(coords1, coords2):
    R = 6371  # Earth's radius in kilometers
    lat1, lon1 = math.radians(coords1['lat']), math.radians(coords1['lng'])
    lat2, lon2 = math.radians(coords2['lat']), math.radians(coords2['lng'])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# --- NEW: Function to send email ---
def send_alert_email(recipients, stray_friend_name, coordinates):
    try:
        msg = Message(
            subject=f"⚠️ Safety Alert: {stray_friend_name} is separated from the group!",
            sender=('SafeTravel Alert', app.config['MAIL_USERNAME']),
            recipients=recipients
        )
        msg.body = f"Hello,\n\nThis is an automated alert from the Smart Tourist Safety System.\n\nYour friend, {stray_friend_name}, is currently more than 500 meters away from the rest of your group.\n\nTheir last known coordinates are:\nLatitude: {coordinates['lat']}\nLongitude: {coordinates['lng']}\n\nPlease check in with them to ensure they are safe.\n\n- The SafeTravel Team"
        mail.send(msg)
        print(f"Alert email sent to {recipients}")
    except Exception as e:
        print(f"Error sending email: {e}")

# --- AUTHENTICATION ROUTES ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not name or not username or not email or not password:
        return jsonify({'message': 'Missing required fields'}), 400

    if mongo.db.users.find_one({'username': username}):
        return jsonify({'message': 'Username is already taken'}), 409
    if mongo.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email is already registered'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # --- CHANGED PART STARTS HERE ---
    
    # Insert new user and get their newly created ID
    new_user = mongo.db.users.insert_one({
        'name': name,
        'username': username,
        'email': email,
        'password': hashed_password
    })
    
    # Create a token for the new user immediately
    token = jwt.encode({
        'user_id': str(new_user.inserted_id),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    # Return the token along with the success message
    return jsonify({
        'message': 'User created successfully',
        'access_token': token
    }), 201


@app.route('/api/auth/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = mongo.db.users.find_one({'username': username})

    if user and bcrypt.check_password_hash(user['password'], password):
        # Create a token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(hours=24) # Token expires in 24 hours
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({'message': 'Login successful', 'access_token': token})

    return jsonify({'message': 'Invalid email or password'}), 401

# --- NEW: Google Authentication Route ---
@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    # The frontend will send JSON {credential: "<id-token>"}
    token = request.json.get('credential')
    if not token:
        return jsonify({"message": "Missing token"}), 400

    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(token, grequests.Request(), GOOGLE_CLIENT_ID)
        # idinfo now contains the user’s info (email, name, sub (Google user id))
        google_user_id = idinfo['sub']
        email = idinfo.get('email')
        name = idinfo.get('name')

        # TODO: check if this email/user already exists in your DB; create or log in
        # then generate your own JWT and return it to the frontend:
        return jsonify({
            "access_token": "your-own-jwt-here",
            "user": {"name": name, "email": email}
        })
    except ValueError:
        return jsonify({"message": "Invalid Google token"}), 401


# --- PROTECTED ROUTES ---

@app.route('/api/id/generate', methods=['POST'])
@token_required # This decorator protects the route
def generate_id(current_user):
    # The 'current_user' object is passed from the decorator
    print(f"Request received from user: {current_user['name']} ({current_user['email']})")

    # Get the form data from the frontend request
    id_data = request.get_json()

    # --- TODO: Add your blockchain logic here ---
    # 1. Take the id_data.
    # 2. Process it, maybe interact with a smart contract.
    # 3. Save the final ID details to the database, linked to the current_user['_id'].

    return jsonify({
        'message': f"Digital ID for {current_user['name']} processed successfully!",
        'received_data': id_data
    })

@app.route('/api/id/save', methods=['POST'])
@token_required
def save_digital_id(current_user):
    """Saves the digital ID data to the current user's document in MongoDB."""
    id_data = request.get_json()
    
    # We use '$set' to add or update the 'digitalId' field in the user's document
    mongo.db.users.update_one(
        {'_id': ObjectId(current_user['_id'])},
        {'$set': {'digitalId': id_data}}
    )
    
    return jsonify({'message': 'Digital ID saved successfully'}), 200


@app.route('/api/id/fetch', methods=['GET'])
@token_required
def fetch_digital_id(current_user):
    """Fetches the saved digital ID data for the current user."""
    user = mongo.db.users.find_one({'_id': ObjectId(current_user['_id'])})
    
    # Check if the 'digitalId' field exists and return it
    if user and 'digitalId' in user:
        return jsonify({'digitalId': user['digitalId']}), 200
    else:
        # If no ID is found, return a null or empty object
        return jsonify({'digitalId': None}), 404


@app.route('/api/id/delete', methods=['DELETE'])
@token_required
def delete_digital_id(current_user):
    """Deletes the digital ID data from the current user's document."""
    
    # We use '$unset' to completely remove the 'digitalId' field
    mongo.db.users.update_one(
        {'_id': ObjectId(current_user['_id'])},
        {'$unset': {'digitalId': ""}}
    )
    
    return jsonify({'message': 'Digital ID removed successfully'}), 200

# --- NEW: Endpoint to check friend locations and send alerts ---
@app.route('/api/group/check-locations', methods=['POST'])
@token_required
def check_locations(current_user):
    data = request.get_json()
    friend_locations = data.get('friendLocations', {})
    
    if len(friend_locations) < 2:
        return jsonify({'message': 'Not enough location data to check'}), 400

    # --- DYNAMIC LOGIC ---
    avg_lat, avg_lng, count = 0, 0, 0
    for loc in friend_locations.values():
        avg_lat += loc['lat']
        avg_lng += loc['lng']
        count += 1
    
    if count == 0:
        return jsonify({'message': 'No locations provided'}), 400
        
    group_center = {'lat': avg_lat / count, 'lng': avg_lng / count}
    
    SAFE_DISTANCE_KM = 0.2
    stray_friends = []
    safe_friends_usernames = []

    for username, loc in friend_locations.items():
        distance = haversine_distance(group_center, loc)
        print(f"Checking distance for {username}: {distance:.2f} km") # <-- ADDED FOR DEBUGGING
        if distance > SAFE_DISTANCE_KM:
            stray_friends.append({'username': username, 'location': loc})
        else:
            safe_friends_usernames.append(username)
    
    if stray_friends and safe_friends_usernames:
        safe_users_cursor = mongo.db.users.find({'username': {'$in': safe_friends_usernames}})
        recipient_emails = [user['email'] for user in safe_users_cursor if 'email' in user]

        if not recipient_emails:
            return jsonify({'message': 'No recipients found to send alerts to.'}), 200

        for stray_friend in stray_friends:
            stray_username = stray_friend['username']
            if stray_username not in alerts_sent_for_user:
                print(f"ALERT: User {stray_username} is too far away! Sending email to {recipient_emails}")
                send_alert_email(recipient_emails, stray_username, stray_friend['location'])
                alerts_sent_for_user[stray_username] = True
            else:
                print(f"INFO: Alert for {stray_username} has already been sent.")
    
    return jsonify({'message': 'Locations checked'}), 200

# --- NEW: Endpoint to add friends by username ---
@app.route('/api/group/add-member', methods=['POST'])
@token_required
def add_member(current_user):
    data = request.get_json()
    username_to_add = data.get('username')

    if not username_to_add:
        return jsonify({'message': 'Username is required'}), 400

    user_to_add = mongo.db.users.find_one({'username': username_to_add})

    if not user_to_add:
        return jsonify({'message': 'User not found'}), 404

    # In a real app, you would add this user to a 'group' in the database.
    # For the demo, we just confirm they exist and return their details.
    return jsonify({
        'message': f'User {username_to_add} found successfully!',
        'user': {
            'id': str(user_to_add['_id']),
            'name': user_to_add['name'],
            'username': user_to_add['username']
        }
    }), 200

@app.route('/api/group/reset-alerts', methods=['POST'])
@token_required
def reset_alerts(current_user):
    global alerts_sent_for_user
    alerts_sent_for_user = {} # This clears the dictionary
    print("Alert memory has been reset.")
    return jsonify({'message': 'Alert memory has been reset'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)