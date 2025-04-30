from flask import Flask, request, jsonify
import pandas as pd
from sqlalchemy import create_engine

app = Flask(__name__)

# Connexion
engine = create_engine("mysql+mysqlconnector://root:@localhost/club-int3")

def recommend_clubs_by_category(user_id: int):
    # Charger les données avec des logs détaillés
    print(f"Début de la recommandation pour l'utilisateur {user_id}")
    
    # Chargement des données
    members = pd.read_sql("SELECT club_id, id AS user_id FROM `club_members`", engine)
    print(f"Table members chargée: {len(members)} entrées")
    print(members.head())
    
    clubs = pd.read_sql("SELECT id_club AS club_id, name, categorie FROM `table-club`", engine)
    print(f"Table clubs chargée: {len(clubs)} entrées")
    print(clubs.head())
    
    # Vérifier les types de données pour éviter des problèmes de correspondance
    print(f"Type de club_id dans members: {members['club_id'].dtype}")
    print(f"Type de club_id dans clubs: {clubs['club_id'].dtype}")
    
    # Trouver les clubs rejoints par l'utilisateur
    user_memberships = members[members.user_id == user_id]
    print(f"L'utilisateur {user_id} est membre de {len(user_memberships)} clubs")
    
    if len(user_memberships) == 0:
        print("L'utilisateur n'est membre d'aucun club, impossible de faire des recommandations par catégorie")
        return []
    
    joined = user_memberships["club_id"].unique()
    print(f"Club IDs rejoints: {joined}")
    
    # Vérifier si ces club_id existent dans la table clubs
    existing_clubs = clubs[clubs.club_id.isin(joined)]
    print(f"Clubs trouvés dans la base de données: {len(existing_clubs)}/{len(joined)}")
    
    if len(existing_clubs) == 0:
        print("Aucun des clubs de l'utilisateur n'a été trouvé dans la table des clubs")
        return []
    
    # Trouver les catégories
    cats = existing_clubs["categorie"].unique()
    print(f"Catégories trouvées: {cats}")
    
    if len(cats) == 0:
        print("Aucune catégorie trouvée")
        return []
    
    # Recommander des clubs de mêmes catégories que l'utilisateur n'a pas encore rejoints
    category_matches = clubs[clubs.categorie.isin(cats)]
    print(f"Total des clubs dans les mêmes catégories: {len(category_matches)}")
    
    not_joined = category_matches[~category_matches.club_id.isin(joined)]
    print(f"Clubs non encore rejoints dans ces catégories: {len(not_joined)}")
    
    if len(not_joined) == 0:
        print("Aucune recommandation disponible: l'utilisateur est déjà membre de tous les clubs dans ces catégories")
        return []
    
    print("Recommandations finales:")
    print(not_joined[["club_id", "name", "categorie"]])
    
    return not_joined.to_dict(orient="records")

@app.route("/recommend", methods=["GET"])
def recommend():
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return jsonify({"error": "Veuillez passer ?user_id=…"}), 400
    
    recommendations = recommend_clubs_by_category(user_id)
    return jsonify(recommendations)

if __name__ == "__main__":
    # Par défaut sur http://127.0.0.1:5000
    app.run(debug=True)