const config = {
    'root': 'http://localhost:5173',
    'image_server': 'http://localhost:8090',
    'sam_server': 'http://localhost:6000',
    'database': {
        'host': 'localhost',
        'user': 'postgres',
        'password': 'postgres',
        'db': 'postgres',
        'port': '5432',
        'allowed_tables': ['websam']
    }
}
export default config;