-- Insert sample user (required as foreign keys)
INSERT INTO `user` (`id`, `date_created`, `email`, `first_name`, `is_active`, `last_login`, `last_name`, `password`, `role`, `username`) VALUES
(1, '2025-01-15 09:30:00.000000', 'john.doe@example.com', 'John', b'1', '2025-03-26 14:20:00.000000', 'Doe', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'USER', 'johndoe'),
(2, '2025-01-20 10:15:00.000000', 'jane.smith@example.com', 'Jane', b'1', '2025-03-27 08:45:00.000000', 'Smith', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'USER', 'janesmith'),
(3, '2025-02-05 11:00:00.000000', 'mike.johnson@example.com', 'Mike', b'1', '2025-03-25 16:30:00.000000', 'Johnson', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'USER', 'mikej'),
(4, '2025-02-10 14:20:00.000000', 'sarah.williams@example.com', 'Sarah', b'1', '2025-03-27 10:15:00.000000', 'Williams', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'ADMIN', 'sarahw');

-- Insert sample projects
INSERT INTO `projet` (`id`, `date_created`, `description`, `image_url`, `last_updated`, `nom`, `status`, `user_id`) VALUES
(1, '2025-02-15 10:00:00.000000', 'Development of a new club management platform', 'https://example.com/images/project1.jpg', '2025-03-20 15:30:00.000000', 'ClubSync Platform', 'IN_PROGRESS', 1),
(2, '2025-02-20 14:00:00.000000', 'Mobile app for event notifications and registration', 'https://example.com/images/project2.jpg', '2025-03-25 11:45:00.000000', 'EventMobile App', 'PLANNING', 2),
(3, '2025-03-01 09:30:00.000000', 'Website redesign for the student clubs portal', 'https://example.com/images/project3.jpg', '2025-03-26 16:20:00.000000', 'Club Portal Redesign', 'COMPLETED', 4),
(4, '2025-03-10 13:15:00.000000', 'Database migration and optimization project', NULL, '2025-03-27 09:00:00.000000', 'Database Upgrade', 'IN_PROGRESS', 3);

-- Insert sample project tasks
INSERT INTO `projet_tache` (`id`, `date_created`, `description`, `last_updated`, `priorite`, `status`, `titre`, `projet_id`) VALUES
(1, '2025-02-16 11:00:00.000000', 'Design the user interface for the dashboard', '2025-02-20 14:30:00.000000', 'HIGH', 'COMPLETED', 'UI Design', 1),
(2, '2025-02-17 09:15:00.000000', 'Implement authentication system', '2025-03-10 16:45:00.000000', 'HIGH', 'IN_PROGRESS', 'Auth System', 1),
(3, '2025-02-21 15:00:00.000000', 'Create wireframes for mobile app', '2025-02-25 10:20:00.000000', 'MEDIUM', 'COMPLETED', 'Wireframing', 2),
(4, '2025-02-22 10:30:00.000000', 'Research push notification services', '2025-03-15 11:10:00.000000', 'LOW', 'COMPLETED', 'Notification Research', 2),
(5, '2025-03-02 10:45:00.000000', 'Create new color scheme for portal', '2025-03-05 14:15:00.000000', 'MEDIUM', 'COMPLETED', 'Color Scheme', 3),
(6, '2025-03-03 14:00:00.000000', 'Implement responsive design', '2025-03-20 16:30:00.000000', 'HIGH', 'IN_PROGRESS', 'Responsive Layout', 3),
(7, '2025-03-11 09:30:00.000000', 'Backup existing database', '2025-03-12 11:45:00.000000', 'HIGH', 'COMPLETED', 'Database Backup', 4),
(8, '2025-03-12 14:15:00.000000', 'Optimize slow queries', '2025-03-26 10:20:00.000000', 'HIGH', 'IN_PROGRESS', 'Query Optimization', 4);

-- Insert sample project messages
INSERT INTO `projet_message` (`id`, `contenu`, `projet_id`) VALUES
(1, 'Has everyone reviewed the UI mockups I shared? We need feedback before we can proceed with implementation.', 1),
(2, 'I\'ve completed the initial wireframes for the mobile app. Please check the shared folder and provide your comments.', 2),
(3, 'The color scheme has been approved by the client. We can now move forward with the implementation.', 3),
(4, 'Important: Database maintenance scheduled for this weekend. The system will be unavailable from 10 PM Saturday to 6 AM Sunday.', 4),
(5, 'We need to discuss the authentication requirements in more detail. Let\'s schedule a meeting for tomorrow.', 1),
(6, 'The push notification research is complete. I recommend using Firebase for our needs.', 2),
(7, 'I\'ve encountered an issue with the responsive layout on mobile devices. Need help debugging.', 3),
(8, 'Query optimization is taking longer than expected. We might need to adjust the timeline.', 4);

-- Insert sample project reports
INSERT INTO `projet_report` (`id`, `date_created`, `description`, `title`, `projet_id`, `user_id`, `tache_id`) VALUES
(1, '2025-02-28 16:00:00.000000', 'Completed the UI design phase with positive feedback from stakeholders. Moving to implementation.', 'February Progress Report', 1, 1, 1),
(2, '2025-03-05 14:30:00.000000', 'Identified three potential push notification services. Firebase seems to be the best option based on our requirements.', 'Notification Research Findings', 2, 2, 4),
(3, '2025-03-15 11:20:00.000000', 'Color scheme implementation completed. Responsive design is 70% done with some mobile issues remaining.', 'Design Phase Update', 3, 4, 5),
(4, '2025-03-20 10:00:00.000000', 'Database backup completed successfully. Optimization has improved query times by 40% so far.', 'Database Migration Status', 4, 3, 7),
(5, '2025-03-25 15:45:00.000000', 'Authentication system implementation delayed due to unexpected security requirements.', 'Auth System Delay', 1, 1, 2);-- Insert sample users (required as foreign keys)
-- Insert sample user (required as foreign keys)
INSERT INTO `user` (`id`, `date_created`, `email`, `first_name`, `is_active`, `last_login`, `last_name`, `password`, `role`, `username`) VALUES
(1, '2025-01-15 09:30:00.000000', 'john.doe@example.com', 'John', b'1', '2025-03-26 14:20:00.000000', 'Doe', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'USER', 'johndoe'),
(2, '2025-01-20 10:15:00.000000', 'jane.smith@example.com', 'Jane', b'1', '2025-03-27 08:45:00.000000', 'Smith', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'USER', 'janesmith'),
(3, '2025-02-05 11:00:00.000000', 'mike.johnson@example.com', 'Mike', b'1', '2025-03-25 16:30:00.000000', 'Johnson', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'USER', 'mikej'),
(4, '2025-02-10 14:20:00.000000', 'sarah.williams@example.com', 'Sarah', b'1', '2025-03-27 10:15:00.000000', 'Williams', '$2a$10$xJwL5v5Jz7t6V5V5V5V5Ve', 'ADMIN', 'sarahw');

-- Insert sample projects
INSERT INTO `projet` (`id`, `date_created`, `description`, `image_url`, `last_updated`, `nom`, `status`, `user_id`) VALUES
(1, '2025-02-15 10:00:00.000000', 'Development of a new club management platform', 'https://example.com/images/project1.jpg', '2025-03-20 15:30:00.000000', 'ClubSync Platform', 'IN_PROGRESS', 1),
(2, '2025-02-20 14:00:00.000000', 'Mobile app for event notifications and registration', 'https://example.com/images/project2.jpg', '2025-03-25 11:45:00.000000', 'EventMobile App', 'PLANNING', 2),
(3, '2025-03-01 09:30:00.000000', 'Website redesign for the student clubs portal', 'https://example.com/images/project3.jpg', '2025-03-26 16:20:00.000000', 'Club Portal Redesign', 'COMPLETED', 4),
(4, '2025-03-10 13:15:00.000000', 'Database migration and optimization project', NULL, '2025-03-27 09:00:00.000000', 'Database Upgrade', 'IN_PROGRESS', 3);

-- Insert sample project tasks
INSERT INTO `projet_tache` (`id`, `date_created`, `description`, `last_updated`, `priorite`, `status`, `titre`, `projet_id`) VALUES
(1, '2025-02-16 11:00:00.000000', 'Design the user interface for the dashboard', '2025-02-20 14:30:00.000000', 'HIGH', 'COMPLETED', 'UI Design', 1),
(2, '2025-02-17 09:15:00.000000', 'Implement authentication system', '2025-03-10 16:45:00.000000', 'HIGH', 'IN_PROGRESS', 'Auth System', 1),
(3, '2025-02-21 15:00:00.000000', 'Create wireframes for mobile app', '2025-02-25 10:20:00.000000', 'MEDIUM', 'COMPLETED', 'Wireframing', 2),
(4, '2025-02-22 10:30:00.000000', 'Research push notification services', '2025-03-15 11:10:00.000000', 'LOW', 'COMPLETED', 'Notification Research', 2),
(5, '2025-03-02 10:45:00.000000', 'Create new color scheme for portal', '2025-03-05 14:15:00.000000', 'MEDIUM', 'COMPLETED', 'Color Scheme', 3),
(6, '2025-03-03 14:00:00.000000', 'Implement responsive design', '2025-03-20 16:30:00.000000', 'HIGH', 'IN_PROGRESS', 'Responsive Layout', 3),
(7, '2025-03-11 09:30:00.000000', 'Backup existing database', '2025-03-12 11:45:00.000000', 'HIGH', 'COMPLETED', 'Database Backup', 4),
(8, '2025-03-12 14:15:00.000000', 'Optimize slow queries', '2025-03-26 10:20:00.000000', 'HIGH', 'IN_PROGRESS', 'Query Optimization', 4);

-- Insert sample project messages
INSERT INTO `projet_message` (`id`, `contenu`, `projet_id`) VALUES
(1, 'Has everyone reviewed the UI mockups I shared? We need feedback before we can proceed with implementation.', 1),
(2, 'I\'ve completed the initial wireframes for the mobile app. Please check the shared folder and provide your comments.', 2),
(3, 'The color scheme has been approved by the client. We can now move forward with the implementation.', 3),
(4, 'Important: Database maintenance scheduled for this weekend. The system will be unavailable from 10 PM Saturday to 6 AM Sunday.', 4),
(5, 'We need to discuss the authentication requirements in more detail. Let\'s schedule a meeting for tomorrow.', 1),
(6, 'The push notification research is complete. I recommend using Firebase for our needs.', 2),
(7, 'I\'ve encountered an issue with the responsive layout on mobile devices. Need help debugging.', 3),
(8, 'Query optimization is taking longer than expected. We might need to adjust the timeline.', 4);

-- Insert sample project reports
INSERT INTO `projet_report` (`id`, `date_created`, `description`, `title`, `projet_id`, `user_id`, `tache_id`) VALUES
(1, '2025-02-28 16:00:00.000000', 'Completed the UI design phase with positive feedback from stakeholders. Moving to implementation.', 'February Progress Report', 1, 1, 1),
(2, '2025-03-05 14:30:00.000000', 'Identified three potential push notification services. Firebase seems to be the best option based on our requirements.', 'Notification Research Findings', 2, 2, 4),
(3, '2025-03-15 11:20:00.000000', 'Color scheme implementation completed. Responsive design is 70% done with some mobile issues remaining.', 'Design Phase Update', 3, 4, 5),
(4, '2025-03-20 10:00:00.000000', 'Database backup completed successfully. Optimization has improved query times by 40% so far.', 'Database Migration Status', 4, 3, 7),
(5, '2025-03-25 15:45:00.000000', 'Authentication system implementation delayed due to unexpected security requirements.', 'Auth System Delay', 1, 1, 2);-- Insert sample users (required as foreign keys)
