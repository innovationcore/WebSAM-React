BEGIN;

-- Create users table
CREATE TABLE IF NOT EXISTS users(
	id TEXT NOT NULL PRIMARY KEY, 
	preferredusername VARCHAR(255),
	givenname VARCHAR(255),
	surname VARCHAR(255),
	email VARCHAR(255),
	displayname VARCHAR(255),
	jobtitle VARCHAR(255),
	officelocation VARCHAR(255),
	me JSON,
	roles JSON NOT NULL
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions(
	session_id VARCHAR(36) NOT NULL PRIMARY KEY, 
	user_id TEXT NOT NULL, 
	token json NOT NULL,
	CONSTRAINT user_sessions_users_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create the table for storing WebSAM Images and their data
CREATE TABLE IF NOT EXISTS websam (
    upload_id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    thumbnail TEXT NOT NULL,
    date_uploaded TIMESTAMP DEFAULT NOW(),
    points_json JSONB,
    overlay_json JSONB
);


COMMIT;