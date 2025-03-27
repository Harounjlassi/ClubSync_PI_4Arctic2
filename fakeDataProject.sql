-- Insert roles first since other tables depend on it
INSERT INTO `role` (`id`, `name`) VALUES
(1, 'ADMIN'),
(2, 'USER');

-- Insert users (10 users)
INSERT INTO `user` (`id`, `last_modified_date`, `account_locked`, `created_date`, `date_of_birth`, `email`, `enabled`, `firstname`, `lastname`, `password`, `id_role`) VALUES
(1, '2025-01-15 09:30:45.000000', b'0', '2024-12-01 08:00:00.000000', '1995-05-10', 'admin@clubsync.com', b'1', 'Admin', 'User', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 1),
(2, '2025-01-10 14:22:33.000000', b'0', '2024-12-05 10:15:00.000000', '1998-07-22', 'user1@example.com', b'1', 'Emma', 'Johnson', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(3, '2025-01-12 11:45:21.000000', b'0', '2024-12-10 09:30:00.000000', '1997-03-15', 'user2@example.com', b'1', 'Liam', 'Smith', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(4, '2025-01-18 16:10:05.000000', b'0', '2024-12-15 14:00:00.000000', '1999-11-30', 'user3@example.com', b'1', 'Olivia', 'Williams', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(5, '2025-01-20 13:33:47.000000', b'0', '2024-12-20 11:45:00.000000', '1996-09-18', 'user4@example.com', b'1', 'Noah', 'Brown', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(6, '2025-01-22 10:05:12.000000', b'0', '2024-12-25 16:30:00.000000', '2000-02-25', 'user5@example.com', b'1', 'Ava', 'Jones', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(7, '2025-01-25 08:42:19.000000', b'0', '2025-01-05 09:15:00.000000', '1998-08-12', 'user6@example.com', b'1', 'William', 'Garcia', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(8, '2025-01-28 15:20:38.000000', b'0', '2025-01-10 14:45:00.000000', '1997-04-05', 'user7@example.com', b'1', 'Sophia', 'Miller', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(9, '2025-02-01 12:18:27.000000', b'0', '2025-01-15 10:30:00.000000', '1999-12-08', 'user8@example.com', b'1', 'James', 'Davis', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2),
(10, '2025-02-05 09:55:41.000000', b'0', '2025-01-20 13:00:00.000000', '1996-06-20', 'user9@example.com', b'1', 'Isabella', 'Rodriguez', '$2a$10$xJwL5v5z5U6JZ5JZ5JZ5Zu5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 2);

-- Insert projects (5 projects)
INSERT INTO `projet` (`id`, `date_created`, `description`, `image_url`, `last_updated`, `nom`, `status`, `user_id`) VALUES
(1, '2025-01-05 10:00:00.000000', 'Development of a new club management platform with modern features', 'https://example.com/images/project1.jpg', '2025-03-10 14:30:00.000000', 'ClubSync Platform', 'IN_PROGRESS', 1),
(2, '2025-01-10 11:15:00.000000', 'Mobile app for event notifications and club communications', 'https://example.com/images/project2.jpg', '2025-03-15 09:45:00.000000', 'Club Mobile App', 'PLANNING', 2),
(3, '2025-01-15 14:30:00.000000', 'Website redesign for the university clubs portal', 'https://example.com/images/project3.jpg', '2025-03-20 16:20:00.000000', 'Clubs Portal Redesign', 'IN_PROGRESS', 3),
(4, '2025-01-20 09:00:00.000000', 'Analytics dashboard for tracking club engagement metrics', 'https://example.com/images/project4.jpg', '2025-03-01 11:10:00.000000', 'Club Analytics Dashboard', 'COMPLETED', 4),
(5, '2025-01-25 13:45:00.000000', 'Integration with university authentication systems', 'https://example.com/images/project5.jpg', '2025-03-05 15:00:00.000000', 'Auth System Integration', 'ON_HOLD', 5);

-- Insert project tasks (3-5 tasks per project)
INSERT INTO `projet_tache` (`id`, `date_created`, `description`, `last_updated`, `priorite`, `status`, `titre`, `projet_id`) VALUES
-- Project 1 tasks
(1, '2025-01-06 09:00:00.000000', 'Design database schema for user management', '2025-01-20 14:00:00.000000', 'HIGH', 'COMPLETED', 'Database Design', 1),
(2, '2025-01-07 10:30:00.000000', 'Implement user authentication endpoints', '2025-02-15 11:45:00.000000', 'HIGH', 'IN_PROGRESS', 'Auth Implementation', 1),
(3, '2025-01-10 14:00:00.000000', 'Create UI mockups for admin dashboard', '2025-01-25 16:30:00.000000', 'MEDIUM', 'COMPLETED', 'UI Mockups', 1),
(4, '2025-01-15 11:00:00.000000', 'Set up CI/CD pipeline for automated testing', '2025-02-28 10:15:00.000000', 'MEDIUM', 'IN_PROGRESS', 'CI/CD Setup', 1),

-- Project 2 tasks
(5, '2025-01-12 10:00:00.000000', 'Research cross-platform frameworks', '2025-01-18 15:30:00.000000', 'HIGH', 'COMPLETED', 'Framework Research', 2),
(6, '2025-01-15 14:00:00.000000', 'Define app feature requirements', '2025-01-25 11:20:00.000000', 'MEDIUM', 'COMPLETED', 'Requirements Gathering', 2),
(7, '2025-01-20 09:30:00.000000', 'Create initial project timeline', '2025-01-22 16:45:00.000000', 'LOW', 'COMPLETED', 'Project Planning', 2),

-- Project 3 tasks
(8, '2025-01-16 11:00:00.000000', 'Audit current website for improvements', '2025-01-20 14:30:00.000000', 'HIGH', 'COMPLETED', 'Website Audit', 3),
(9, '2025-01-18 14:00:00.000000', 'Design new information architecture', '2025-02-05 10:15:00.000000', 'HIGH', 'IN_PROGRESS', 'Information Architecture', 3),
(10, '2025-01-22 10:30:00.000000', 'Create wireframes for key pages', '2025-02-10 15:45:00.000000', 'MEDIUM', 'IN_PROGRESS', 'Wireframing', 3),
(11, '2025-01-25 13:00:00.000000', 'Develop style guide and design system', '2025-02-15 11:00:00.000000', 'MEDIUM', 'NOT_STARTED', 'Design System', 3),

-- Project 4 tasks
(12, '2025-01-21 09:00:00.000000', 'Identify key metrics to track', '2025-01-25 16:00:00.000000', 'HIGH', 'COMPLETED', 'Metrics Definition', 4),
(13, '2025-01-22 14:30:00.000000', 'Set up data collection pipeline', '2025-02-05 11:45:00.000000', 'HIGH', 'COMPLETED', 'Data Pipeline', 4),
(14, '2025-01-25 10:00:00.000000', 'Build visualization components', '2025-02-10 15:30:00.000000', 'MEDIUM', 'COMPLETED', 'Visualizations', 4),
(15, '2025-01-28 13:15:00.000000', 'Implement user access controls', '2025-02-12 10:45:00.000000', 'MEDIUM', 'COMPLETED', 'Access Controls', 4),

-- Project 5 tasks
(16, '2025-01-26 10:30:00.000000', 'Document current auth systems', '2025-01-28 14:15:00.000000', 'HIGH', 'COMPLETED', 'System Documentation', 5),
(17, '2025-01-28 14:00:00.000000', 'Identify integration points', '2025-02-05 11:30:00.000000', 'HIGH', 'COMPLETED', 'Integration Analysis', 5),
(18, '2025-02-01 09:45:00.000000', 'Develop prototype integration', '2025-02-15 16:00:00.000000', 'MEDIUM', 'ON_HOLD', 'Prototype Development', 5);

-- Insert project messages (3-5 messages per project)
INSERT INTO `projet_message` (`id`, `contenu`, `projet_id`) VALUES
-- Project 1 messages
(1, 'Has everyone reviewed the database schema? I think we need to add a clubs table to track membership.', 1),
(2, 'I\'ve completed the initial ER diagram. Please review and provide feedback by Friday.', 1),
(3, 'The auth implementation is taking longer than expected due to OAuth complexities. We might need to adjust the timeline.', 1),
(4, 'UI mockups are ready for review. I\'ve shared them in the design channel.', 1),

-- Project 2 messages
(5, 'After researching, I recommend Flutter for cross-platform development. It has good community support.', 2),
(6, 'We should schedule meetings with club leaders to gather requirements for the mobile app.', 2),
(7, 'I\'ve created a preliminary timeline but we need to account for university approval processes.', 2),

-- Project 3 messages
(8, 'The website audit revealed several accessibility issues we should address in the redesign.', 3),
(9, 'I\'ve started work on the information architecture. Should we organize by club type or alphabetically?', 3),
(10, 'Wireframes for the homepage and club directory are ready for feedback.', 3),
(11, 'We need to decide on a color scheme that aligns with university branding guidelines.', 3),

-- Project 4 messages
(12, 'The analytics team provided the metrics they want to track. I\'ve added them to our document.', 4),
(13, 'Data pipeline is set up and collecting test data successfully.', 4),
(14, 'The first set of visualizations is complete. Let me know if you want any changes to the charts.', 4),
(15, 'All tasks completed ahead of schedule! Great work everyone.', 4),

-- Project 5 messages
(16, 'I\'ve documented the current auth systems. The university uses a mix of LDAP and OAuth.', 5),
(17, 'Identified 3 key integration points with the main identity provider.', 5),
(18, 'Prototype development is on hold pending security review approval.', 5);

-- Insert project reports (1-2 reports per project)
INSERT INTO `projet_report` (`id`, `date_created`, `description`, `title`, `projet_id`, `user_id`, `tache_id`) VALUES
-- Project 1 reports
(1, '2025-01-15 16:00:00.000000', 'Initial project setup complete. Database schema finalized and approved. Auth implementation is 30% complete. UI mockups in review.', 'Project 1 - Status Update', 1, 1, NULL),
(2, '2025-02-01 14:30:00.000000', 'Authentication implementation delayed due to OAuth complexity. Need 2 more weeks. All other tasks on track.', 'Auth Implementation Delay', 1, 2, 2),

-- Project 2 reports
(3, '2025-01-20 11:00:00.000000', 'Framework research complete - selected Flutter. Requirements gathering 80% complete. Project timeline drafted.', 'Project 2 - Planning Phase Complete', 2, 2, NULL),

-- Project 3 reports
(4, '2025-01-25 15:45:00.000000', 'Website audit complete - identified 15 accessibility issues. Information architecture 50% complete. Wireframing started.', 'Redesign Progress Report', 3, 3, NULL),
(5, '2025-02-10 10:15:00.000000', 'Wireframes received positive feedback from stakeholders. Need to finalize color scheme with marketing.', 'Wireframe Approval', 3, 4, 10),

-- Project 4 reports
(6, '2025-02-05 13:30:00.000000', 'All key metrics identified and data pipeline operational. Visualization development underway.', 'Analytics Dashboard Progress', 4, 4, NULL),
(7, '2025-02-15 09:00:00.000000', 'Project completed successfully! All features implemented and tested. Ready for deployment.', 'Project Completion', 4, 5, NULL),

-- Project 5 reports
(8, '2025-02-01 16:45:00.000000', 'System documentation complete. Integration points identified. Prototype development started but now on hold.', 'Integration Status Update', 5, 5, NULL);