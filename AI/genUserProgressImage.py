import os
from PIL import Image, ImageDraw, ImageFont
import mysql.connector
from datetime import datetime

class ProjectDashboardGenerator:
    def __init__(self, db_config, image_dir="images"):
        self.db_config = db_config
        self.image_dir = image_dir
        self.font = None
        self.title_font = None
        self._load_fonts()

    def _load_fonts(self):
        """Load system fonts with fallback to defaults"""
        try:
            self.font = ImageFont.truetype("arial.ttf", 18)
            self.title_font = ImageFont.truetype("arial.ttf", 24)
        except:
            self.font = ImageFont.load_default()
            self.title_font = ImageFont.load_default()

    def _get_priority_color(self, priority):
        """Determine color based on priority level"""
        priority = str(priority).upper()
        return {
            'HIGH': (255, 100, 100),    # Red
            'MEDIUM': (255, 200, 100),  # Orange
            'LOW': (100, 255, 100),     # Green
        }.get(priority, (200, 200, 200)) # Default gray

    def _find_user_image(self, username):
        """Match username with local image files"""
        if not username or not os.path.isdir(self.image_dir):
            return None
            
        username = username.lower()
        for img_file in os.listdir(self.image_dir):
            if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                # Extract base name (handle formats like "user.1.jpg")
                base_name = os.path.splitext(img_file)[0].split('.')[0].lower()
                if base_name == username:
                    return os.path.join(self.image_dir, img_file)
        return None

    def _draw_task_card(self, draw, x, y, width, task, user_image=None):
        """Render a single task card with all elements"""
        # Draw card background
        card_height = 120
        radius = 10
        draw.rounded_rectangle(
            [x, y, x + width, y + card_height],
            radius=radius,
            fill=self._get_priority_color(task.get('priorite')),
            outline='black',
            width=2
        )

        # Draw task information
        text_x = x + 20
        draw.text((text_x, y + 15), f"User: {task.get('name', 'Unassigned')}", fill='black', font=self.font)
        draw.text((text_x, y + 45), f"Status: {task.get('status', 'N/A')}", fill='black', font=self.font)
        draw.text((text_x, y + 75), f"Progress: {task.get('progress', 0)}%", fill='black', font=self.font)

        # Draw user image if available
        if user_image:
            try:
                img = Image.open(user_image).resize((80, 80))
                self.dashboard_img.paste(img, (x + width - 100, y + 20))
            except Exception as e:
                print(f"Error loading user image {user_image}: {str(e)}")

        return card_height

    def generate_dashboard(self):
        """Main method to generate the dashboard image"""
        try:
            # Database connection
            db_connection = mysql.connector.connect(**self.db_config)
            cursor = db_connection.cursor(dictionary=True)

            # Execute your exact query
            cursor.execute("""
                SELECT u.id as user_id, u.username as name, 
                       t.status, t.progress, 
                       t.priorite
                FROM user u
                LEFT JOIN projet_tache t ON u.id = t.projet_id
            """)
            tasks = cursor.fetchall()

            # Create dashboard image
            img_width = 1000
            img_height = 150 + (len(tasks) * 140)  # Dynamic height
            self.dashboard_img = Image.new('RGB', (img_width, img_height), 'white')
            draw = ImageDraw.Draw(self.dashboard_img)

            # Draw title
            draw.text((50, 30), "Project Task Dashboard", fill='black', font=self.title_font)

            # Draw each task
            y_offset = 100
            card_width = img_width - 100
            
            for task in tasks:
                username = task.get('name')
                user_image = self._find_user_image(username) if username else None
                
                card_height = self._draw_task_card(
                    draw=draw,
                    x=50,
                    y=y_offset,
                    width=card_width,
                    task=task,
                    user_image=user_image
                )
                
                y_offset += card_height + 20  # Add spacing between cards

            # Save output
            os.makedirs('output', exist_ok=True)
            output_path = 'output/task_dashboard.png'
            self.dashboard_img.save(output_path)
            
            return {
                'success': True,
                'path': output_path,
                'tasks_processed': len(tasks)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'tasks_processed': 0
            }
        finally:
            cursor.close()
            db_connection.close()

# Example Usage
if __name__ == "__main__":
    # Configuration
    config = {
        'db_config': {
            'host': 'localhost',
            'user': 'root',
            'password': '',
            'database': 'club-sync'
         
        },
        'image_dir': '/images'
    }

    # Generate dashboard
    generator = ProjectDashboardGenerator(
        db_config=config['db_config'],
        image_dir=config['image_dir']
    )
    
    result = generator.generate_dashboard()
    
    if result['success']:
        print(f"Dashboard generated successfully at: {result['path']}")
        print(f"Processed {result['tasks_processed']} tasks")
    else:
        print(f"Error generating dashboard: {result['error']}")