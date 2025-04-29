-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2025 at 02:35 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `club-int3`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `id` bigint(20) NOT NULL,
  `content` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `club_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcement`
--

INSERT INTO `announcement` (`id`, `content`, `created_at`, `title`, `club_id`) VALUES
(1, 'ODFJPSDFJOICOKDCOQDKC', '2025-04-27 08:12:10.000000', 'JDSOPFJPODS', 1),
(2, 'OPJDOFPJDSFJPOFSJFPODJPO', '2025-04-27 08:12:31.000000', 'QPOFJQPOFJPDOJF', 1);

-- --------------------------------------------------------

--
-- Table structure for table `club_members`
--

CREATE TABLE `club_members` (
  `club_id` bigint(20) NOT NULL,
  `id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `club_members`
--

INSERT INTO `club_members` (`club_id`, `id`) VALUES
(1, 6);

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `event_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projet`
--

CREATE TABLE `projet` (
  `id` bigint(20) NOT NULL,
  `date_created` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` longtext DEFAULT NULL,
  `last_updated` date DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `progress` bigint(20) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projet`
--

INSERT INTO `projet` (`id`, `date_created`, `description`, `image_url`, `last_updated`, `nom`, `progress`, `status`, `user_id`) VALUES
(2, '2025-04-29', 'rooooooooooooooooooooooooooooooooooooooooooot', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAEOBAMAAABWZpChAAAAElBMVEUjHyDu7u7///8MCAlsaWqwr6+YjHMmAAAFQUlEQVR42u3dTXPaMBAGYDWCexDNPdLguxjZ9wTCPXHo//8rtfE3odN45WS17etLS9yZPijySrsSQrnmspvmEvFSAQ000EADDTTQQAP9L6LbP037cxEvgQYaaKCBBhpooIH+J9FIAoAGGmiggQYaaKCBRtUUmQvQQAMNNND/I9pKRL+JQ2dnvbfC0D918NLQr8ErtST66yfBlVlV115SEtCaZaF3jVnfCUJnWjWXJPTRK3EtvWvNSh/koLvOIQndN7TSpRj0UfVoIwU9NLTKxVSY3nuzKqSgrR7Qeynox6F3dMEjffSod3TBI3n0uHfkVkjVdBQ79F5IYmvGveMgBT2MLMobIWjrJ1FaBno3DXgy0KMoXfUOIejtdAyXgR6ew1AKROdyCpBXSYsIdB/xdC6n1Jv5cY8WhtZrJw6tcyMOrX35BcsXXzafvqArs6itE1nQIahS1n6PTKmXk7RNKuNVre7vyaH/zDLOPpxfTm/JoavM5Fw9d2r11uco/buo7oT6UieTFNrYsw6+ukLIn6+avr7TDI3BnxJCm+wp9KN2WDWN3d4c7lS/ibDqQiA72mQ6qFHqnb+57u7D5E71lrrAzY12mfZXsrob1P/wHKZ3huGGvaWPH2RVN6jfzDGoj1duUkC/+o8y7U+b13DjRvV7WDt+9O5Wc1aNHW7+vFYfLDd6XGb85JU7bvS9n43WB8tbNc3mN/Qla+RMAszr/IauezUrmtCjm6ZmRJt7SkPXqxmM6FEZaR56b/nQO1pDq/DM19LjFYpZDV0w9mmnaejI1Yw4NLF3hANjnKbGjpyzwmRosSO6xh6FzmgNXbDW8mhdOr7GHoV+J/doRjSpS7d73biqpsTJUsmajdOew5y3hEB6DvUPXvQ2ZlLKhKbNljxvWYw2Hha8aFLw6Lo0F5oUPPRhIxBteNG0mQdzUf3R04cWLrS5jwkeXGjS2LJnRr+TpngC0WoZNH1eSxoQ75i3ThxJYwvQQAMN9H+DlhmnJaLVDycQvZeILpjRpFleLhHtF0F/c+bSL9UyJbakHJG57kFc2roTWELgruXRijXMVVPaQgBzfZqIvmNdCbDEpU/e5QvaFgRv5K0EXPa3SVtzUToXiFaq5ETTRhel11ba4mf3KEpDX1a4uPaaEgN11dQl49YJ4l6xeoebsP0e3BtkqTGvfhbZtm0+Ujt1/dFKK2rjVaNeGVlb3NqH0fKgyeFjmKKK2QHZJgPC9pqOaglydvWO9lAwoCOexJwr5G0insSCDU3OA/q9TBxo8pPY1fS+fa/pJmZMNExJwCZiSh11fF7sp+Sow0vBid5SuzQnmtip406ii0XTNn5HnkQX/clPUqTWe140KXupojQrmjT98Ib5g8FH2sSDF72lJQC8aEL/8CX7J/Q1aS7NjN56yrSUGT27f1xW5biqpu3L2Tl59PF5S6BnZgLNJ86Y0XPT2+b4bG70zP5RuCTQs+an7VSaHT1rfupdGmj37mcE6VTQWfj8ykWZCnpGKlC4ZNCffhTDIR30jVm1DyH45DYTTl5eH8YUglq9PKlrdt/QaZy2OQkgOqwuR/ptfj5N2LpwJiX0OIBo/9zcdfVpeX4y+08K7e57dcjL4e748LnwbJdBx8+n25fdFyjpsB4f8ueGY/7CepH/aNHTNmvcjeMUrakPVKyvk0sPXeGUWp2uD66se4T99aISPG3zLy9dfwlCb/A1x0ADDTTQQAO9PHqx+TS+mxlooIEGGmiggQYa6ES/DQpJANBAAw000EADDTTQqJoCDTTQQAMNNNBAAy0R/RvS59KvO5/ILQAAAABJRU5ErkJggg==', '2025-04-29', 'iskander', 5, 'IN_PROGRESS', 1),
(3, '2025-04-29', 'rooooooooooooooooooot', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAEOBAMAAABWZpChAAAAElBMVEUjHyDu7u7///8MCAlsaWqwr6+YjHMmAAAFQUlEQVR42u3dTXPaMBAGYDWCexDNPdLguxjZ9wTCPXHo//8rtfE3odN45WS17etLS9yZPijySrsSQrnmspvmEvFSAQ000EADDTTQQAP9L6LbP037cxEvgQYaaKCBBhpooIH+J9FIAoAGGmiggQYaaKCBRtUUmQvQQAMNNND/I9pKRL+JQ2dnvbfC0D918NLQr8ErtST66yfBlVlV115SEtCaZaF3jVnfCUJnWjWXJPTRK3EtvWvNSh/koLvOIQndN7TSpRj0UfVoIwU9NLTKxVSY3nuzKqSgrR7Qeynox6F3dMEjffSod3TBI3n0uHfkVkjVdBQ79F5IYmvGveMgBT2MLMobIWjrJ1FaBno3DXgy0KMoXfUOIejtdAyXgR6ew1AKROdyCpBXSYsIdB/xdC6n1Jv5cY8WhtZrJw6tcyMOrX35BcsXXzafvqArs6itE1nQIahS1n6PTKmXk7RNKuNVre7vyaH/zDLOPpxfTm/JoavM5Fw9d2r11uco/buo7oT6UieTFNrYsw6+ukLIn6+avr7TDI3BnxJCm+wp9KN2WDWN3d4c7lS/ibDqQiA72mQ6qFHqnb+57u7D5E71lrrAzY12mfZXsrob1P/wHKZ3huGGvaWPH2RVN6jfzDGoj1duUkC/+o8y7U+b13DjRvV7WDt+9O5Wc1aNHW7+vFYfLDd6XGb85JU7bvS9n43WB8tbNc3mN/Qla+RMAszr/IauezUrmtCjm6ZmRJt7SkPXqxmM6FEZaR56b/nQO1pDq/DM19LjFYpZDV0w9mmnaejI1Yw4NLF3hANjnKbGjpyzwmRosSO6xh6FzmgNXbDW8mhdOr7GHoV+J/doRjSpS7d73biqpsTJUsmajdOew5y3hEB6DvUPXvQ2ZlLKhKbNljxvWYw2Hha8aFLw6Lo0F5oUPPRhIxBteNG0mQdzUf3R04cWLrS5jwkeXGjS2LJnRr+TpngC0WoZNH1eSxoQ75i3ThxJYwvQQAMN9H+DlhmnJaLVDycQvZeILpjRpFleLhHtF0F/c+bSL9UyJbakHJG57kFc2roTWELgruXRijXMVVPaQgBzfZqIvmNdCbDEpU/e5QvaFgRv5K0EXPa3SVtzUToXiFaq5ETTRhel11ba4mf3KEpDX1a4uPaaEgN11dQl49YJ4l6xeoebsP0e3BtkqTGvfhbZtm0+Ujt1/dFKK2rjVaNeGVlb3NqH0fKgyeFjmKKK2QHZJgPC9pqOaglydvWO9lAwoCOexJwr5G0insSCDU3OA/q9TBxo8pPY1fS+fa/pJmZMNExJwCZiSh11fF7sp+Sow0vBid5SuzQnmtip406ii0XTNn5HnkQX/clPUqTWe140KXupojQrmjT98Ib5g8FH2sSDF72lJQC8aEL/8CX7J/Q1aS7NjN56yrSUGT27f1xW5biqpu3L2Tl59PF5S6BnZgLNJ86Y0XPT2+b4bG70zP5RuCTQs+an7VSaHT1rfupdGmj37mcE6VTQWfj8ykWZCnpGKlC4ZNCffhTDIR30jVm1DyH45DYTTl5eH8YUglq9PKlrdt/QaZy2OQkgOqwuR/ptfj5N2LpwJiX0OIBo/9zcdfVpeX4y+08K7e57dcjL4e748LnwbJdBx8+n25fdFyjpsB4f8ueGY/7CepH/aNHTNmvcjeMUrakPVKyvk0sPXeGUWp2uD66se4T99aISPG3zLy9dfwlCb/A1x0ADDTTQQAO9PHqx+TS+mxlooIEGGmiggQYa6ES/DQpJANBAAw000EADDTTQqJoCDTTQQAMNNNBAAy0R/RvS59KvO5/ILQAAAABJRU5ErkJggg==', '2025-04-29', 'string', 14, 'IN_PROGRESS', 1);

-- --------------------------------------------------------

--
-- Table structure for table `projet_message`
--

CREATE TABLE `projet_message` (
  `id` bigint(20) NOT NULL,
  `contenu` text DEFAULT NULL,
  `date_created` date DEFAULT NULL,
  `last_updated` date DEFAULT NULL,
  `projet_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projet_report`
--

CREATE TABLE `projet_report` (
  `id` bigint(20) NOT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `last_updated` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `projet_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `tache_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projet_tache`
--

CREATE TABLE `projet_tache` (
  `id` bigint(20) NOT NULL,
  `completed_date` datetime(6) DEFAULT NULL,
  `date_created` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `due_date` datetime(6) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `last_updated` datetime(6) DEFAULT NULL,
  `priorite` varchar(255) DEFAULT NULL,
  `progress` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `assignee_id` bigint(20) DEFAULT NULL,
  `projet_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projet_tache`
--

INSERT INTO `projet_tache` (`id`, `completed_date`, `date_created`, `description`, `due_date`, `label`, `last_updated`, `priorite`, `progress`, `status`, `titre`, `assignee_id`, `projet_id`) VALUES
(2, NULL, '2025-04-29 01:09:58.000000', 'qsojpdfj', '2025-04-28 13:00:00.000000', '', '2025-04-29 01:09:58.000000', 'medium', 50, 'todo', 'aaaaa', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `reclamation`
--

CREATE TABLE `reclamation` (
  `id_reclamation` int(11) NOT NULL,
  `archived` bit(1) NOT NULL,
  `date_reclamation` datetime(6) NOT NULL,
  `date_resolution` datetime(6) DEFAULT NULL,
  `description` text NOT NULL,
  `statut` enum('IN_PROGRESS','REJECTED','RESOLVED') NOT NULL,
  `type_reclamation` enum('Club_Communication_Issue','Membership_Request_Delay','OTHER','Project_Organization_Issue') NOT NULL,
  `admin_id` bigint(20) DEFAULT NULL,
  `nuser_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reclamation`
--

INSERT INTO `reclamation` (`id_reclamation`, `archived`, `date_reclamation`, `date_resolution`, `description`, `statut`, `type_reclamation`, `admin_id`, `nuser_id`) VALUES
(1, b'0', '2025-04-28 08:28:27.000000', '2025-04-28 08:33:56.000000', 'string', 'IN_PROGRESS', 'Club_Communication_Issue', 3, 6);

-- --------------------------------------------------------

--
-- Table structure for table `report_participants`
--

CREATE TABLE `report_participants` (
  `report_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id_role` int(11) NOT NULL,
  `role_type` enum('ADMIN','USER') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id_role`, `role_type`) VALUES
(1, 'ADMIN'),
(2, 'USER');

-- --------------------------------------------------------

--
-- Table structure for table `table-club`
--

CREATE TABLE `table-club` (
  `id_club` bigint(20) NOT NULL,
  `categorie` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo` longtext DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `slogan` varchar(255) DEFAULT NULL,
  `creator_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table-club`
--

INSERT INTO `table-club` (`id_club`, `categorie`, `description`, `logo`, `name`, `slogan`, `creator_id`) VALUES
(1, 'Technologie', 'JDSIDFJ%OISDJ', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAAEOBAMAAABWZpChAAAAElBMVEUjHyDu7u7///8MCAlsaWqwr6+YjHMmAAAFQUlEQVR42u3dTXPaMBAGYDWCexDNPdLguxjZ9wTCPXHo//8rtfE3odN45WS17etLS9yZPijySrsSQrnmspvmEvFSAQ000EADDTTQQAP9L6LbP037cxEvgQYaaKCBBhpooIH+J9FIAoAGGmiggQYaaKCBRtUUmQvQQAMNNND/I9pKRL+JQ2dnvbfC0D918NLQr8ErtST66yfBlVlV115SEtCaZaF3jVnfCUJnWjWXJPTRK3EtvWvNSh/koLvOIQndN7TSpRj0UfVoIwU9NLTKxVSY3nuzKqSgrR7Qeynox6F3dMEjffSod3TBI3n0uHfkVkjVdBQ79F5IYmvGveMgBT2MLMobIWjrJ1FaBno3DXgy0KMoXfUOIejtdAyXgR6ew1AKROdyCpBXSYsIdB/xdC6n1Jv5cY8WhtZrJw6tcyMOrX35BcsXXzafvqArs6itE1nQIahS1n6PTKmXk7RNKuNVre7vyaH/zDLOPpxfTm/JoavM5Fw9d2r11uco/buo7oT6UieTFNrYsw6+ukLIn6+avr7TDI3BnxJCm+wp9KN2WDWN3d4c7lS/ibDqQiA72mQ6qFHqnb+57u7D5E71lrrAzY12mfZXsrob1P/wHKZ3huGGvaWPH2RVN6jfzDGoj1duUkC/+o8y7U+b13DjRvV7WDt+9O5Wc1aNHW7+vFYfLDd6XGb85JU7bvS9n43WB8tbNc3mN/Qla+RMAszr/IauezUrmtCjm6ZmRJt7SkPXqxmM6FEZaR56b/nQO1pDq/DM19LjFYpZDV0w9mmnaejI1Yw4NLF3hANjnKbGjpyzwmRosSO6xh6FzmgNXbDW8mhdOr7GHoV+J/doRjSpS7d73biqpsTJUsmajdOew5y3hEB6DvUPXvQ2ZlLKhKbNljxvWYw2Hha8aFLw6Lo0F5oUPPRhIxBteNG0mQdzUf3R04cWLrS5jwkeXGjS2LJnRr+TpngC0WoZNH1eSxoQ75i3ThxJYwvQQAMN9H+DlhmnJaLVDycQvZeILpjRpFleLhHtF0F/c+bSL9UyJbakHJG57kFc2roTWELgruXRijXMVVPaQgBzfZqIvmNdCbDEpU/e5QvaFgRv5K0EXPa3SVtzUToXiFaq5ETTRhel11ba4mf3KEpDX1a4uPaaEgN11dQl49YJ4l6xeoebsP0e3BtkqTGvfhbZtm0+Ujt1/dFKK2rjVaNeGVlb3NqH0fKgyeFjmKKK2QHZJgPC9pqOaglydvWO9lAwoCOexJwr5G0insSCDU3OA/q9TBxo8pPY1fS+fa/pJmZMNExJwCZiSh11fF7sp+Sow0vBid5SuzQnmtip406ii0XTNn5HnkQX/clPUqTWe140KXupojQrmjT98Ib5g8FH2sSDF72lJQC8aEL/8CX7J/Q1aS7NjN56yrSUGT27f1xW5biqpu3L2Tl59PF5S6BnZgLNJ86Y0XPT2+b4bG70zP5RuCTQs+an7VSaHT1rfupdGmj37mcE6VTQWfj8ykWZCnpGKlC4ZNCffhTDIR30jVm1DyH45DYTTl5eH8YUglq9PKlrdt/QaZy2OQkgOqwuR/ptfj5N2LpwJiX0OIBo/9zcdfVpeX4y+08K7e57dcjL4e748LnwbJdBx8+n25fdFyjpsB4f8ueGY/7CepH/aNHTNmvcjeMUrakPVKyvk0sPXeGUWp2uD66se4T99aISPG3zLy9dfwlCb/A1x0ADDTTQQAO9PHqx+TS+mxlooIEGGmiggQYa6ES/DQpJANBAAw000EADDTTQqJoCDTTQQAMNNNBAAy0R/RvS59KvO5/ILQAAAABJRU5ErkJggg==', 'bouhnouh', 'OGIFJ%DP', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `table-comment`
--

CREATE TABLE `table-comment` (
  `id_comment` bigint(20) NOT NULL,
  `comment_date` datetime(6) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `author_id` bigint(20) DEFAULT NULL,
  `forum_post_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table-discussion`
--

CREATE TABLE `table-discussion` (
  `id_forum` bigint(20) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `club_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table-event`
--

CREATE TABLE `table-event` (
  `id_event` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` datetime(6) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `club_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table-forumpost`
--

CREATE TABLE `table-forumpost` (
  `id_post` bigint(20) NOT NULL,
  `content` text DEFAULT NULL,
  `post_date` datetime(6) DEFAULT NULL,
  `author_id` bigint(20) DEFAULT NULL,
  `discussion_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table-message`
--

CREATE TABLE `table-message` (
  `id_message` bigint(20) NOT NULL,
  `contenu` text DEFAULT NULL,
  `auteur_id` bigint(20) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `tache_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table-projet`
--

CREATE TABLE `table-projet` (
  `id_projet` bigint(20) NOT NULL,
  `date_debut` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `createur_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table-report`
--

CREATE TABLE `table-report` (
  `id_report` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `report_date` datetime(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL,
  `reporter_id` bigint(20) DEFAULT NULL,
  `tache_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `table-tache`
--

CREATE TABLE `table-tache` (
  `id_tache` bigint(20) NOT NULL,
  `date_debut` datetime(6) DEFAULT NULL,
  `date_fin` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `priorite` varchar(255) DEFAULT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `assignee_id` bigint(20) DEFAULT NULL,
  `project_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE `token` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `is_valid` bit(1) NOT NULL,
  `token` longtext NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token`
--

INSERT INTO `token` (`id`, `created_at`, `expires_at`, `is_valid`, `token`, `user_id`) VALUES
(2, '2025-04-27 07:22:11.000000', '2025-04-27 09:46:11.000000', b'1', 'eyJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJpc2thbmRlciIsImxhc3ROYW1lIjoicm9vdCIsInByb2ZpbGVQaWN0dXJlIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3VwbG9hZHMvYjMxYTk4OGItMTRhMC00Y2RlLTk4MmEtOTVmMzliZGE3NTc5X3BuZy10cmFuc3BhcmVudC1ibGFjay1zbWFsbC1hcHBsZS1sb2dvLWxvZ28tbWF0ZXJpYWwtYXBwbGUtbG9nby1ibGFjay10aHVtYm5haWwucG5nIiwicm9sZSI6IlVTRVIiLCJwaG9uZU51bWJlciI6NTg2ODk4OTcsImdlbmRlciI6IkhvbW1lIiwiYmlydGhEYXRlIjoxNzE0OTA2ODAwMDAwLCJlbWFpbCI6Imlza2FuZGVyLmJzZXJAZ21haWwuY29tIiwic3ViIjoiaXNrYW5kZXIuYnNlckBnbWFpbC5jb20iLCJpYXQiOjE3NDU3NzgxMzEsImV4cCI6MTc0NTc4Njc3MX0.QCAitUDnLGXBXsdwNryP2Q-NL9cHcRT1cCXL6iLeS5E', 7),
(3, '2025-04-27 07:28:17.000000', '2025-04-27 09:52:17.000000', b'1', 'eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOjgsImZpcnN0TmFtZSI6Imlza2FuZGVyIiwibGFzdE5hbWUiOiJiYWgiLCJwcm9maWxlUGljdHVyZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC91cGxvYWRzLzNlYTBiZmYxLTg5OTEtNGI4MS1hMzYxLTc2NjVhZDE1YzVhNF9wbmctdHJhbnNwYXJlbnQtYmxhY2stc21hbGwtYXBwbGUtbG9nby1sb2dvLW1hdGVyaWFsLWFwcGxlLWxvZ28tYmxhY2stdGh1bWJuYWlsLnBuZyIsInJvbGUiOiJVU0VSIiwicGhvbmVOdW1iZXIiOjg0ODU0NTg0NiwiZ2VuZGVyIjoiSG9tbWUiLCJiaXJ0aERhdGUiOjE3NDQ4ODc2MDAwMDAsImVtYWlsIjoiSXNrYW5kZXIuYnpldEBnbWFpbC5jb20iLCJzdWIiOiJJc2thbmRlci5iemV0QGdtYWlsLmNvbSIsImlhdCI6MTc0NTc3ODQ5NywiZXhwIjoxNzQ1Nzg3MTM3fQ.-PRWnrONAqvfsfC4Qozw0M-yj27dwe5Pa4FGjNIiw5E', 8),
(8, '2025-04-27 07:54:45.000000', '2025-04-27 10:18:45.000000', b'1', 'eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOjksImZpcnN0TmFtZSI6InJvb3QiLCJsYXN0TmFtZSI6Imlza2FuZGVyIiwicHJvZmlsZVBpY3R1cmUiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvdXBsb2Fkcy9iZDE5YThhMy00ZmFmLTQ4YTMtYmI3Ny1mZTY3NjEyODc3MDFfcG5nLXRyYW5zcGFyZW50LWJsYWNrLXNtYWxsLWFwcGxlLWxvZ28tbG9nby1tYXRlcmlhbC1hcHBsZS1sb2dvLWJsYWNrLXRodW1ibmFpbC5wbmciLCJyb2xlIjoiQURNSU4iLCJwaG9uZU51bWJlciI6NTQ4NjU0ODcsImdlbmRlciI6IkhvbW1lIiwiYmlydGhEYXRlIjoxMDE1NDk4ODAwMDAwLCJlbWFpbCI6Imlza2FuZGVyLmJoQGVzcHJpdC50biIsInN1YiI6Imlza2FuZGVyLmJoQGVzcHJpdC50biIsImlhdCI6MTc0NTc4MDA4NSwiZXhwIjoxNzQ1Nzg4NzI1fQ.cpi53dcdMet5473eaQQd-aTSMyCfRWulHR38iiqC-Ew', 9),
(40, '2025-04-28 10:19:17.000000', '2025-04-28 12:43:17.000000', b'1', 'eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOjYsImZpcnN0TmFtZSI6IkhpZWRvdXQiLCJsYXN0TmFtZSI6Imlza2FuZGVyIiwicHJvZmlsZVBpY3R1cmUiOiIvdXBsb2Fkcy83OTlhNTMyNy03NDcyLTQ5MjItYjkxMi1hYzBhMzc1MWI3YzZfcG5nLXRyYW5zcGFyZW50LWJsYWNrLXNtYWxsLWFwcGxlLWxvZ28tbG9nby1tYXRlcmlhbC1hcHBsZS1sb2dvLWJsYWNrLXRodW1ibmFpbC5wbmciLCJyb2xlIjoiVVNFUiIsInBob25lTnVtYmVyIjo1ODQ2ODc5NywiZ2VuZGVyIjoiSG9tbWUiLCJiaXJ0aERhdGUiOjE3Mjc0MzQ4MDAwMDAsImVtYWlsIjoiaXNrYW5kZXIuNDU2YmFocm91bkBnbWFpbC5jb20iLCJzdWIiOiJpc2thbmRlci40NTZiYWhyb3VuQGdtYWlsLmNvbSIsImlhdCI6MTc0NTg3NTE1NywiZXhwIjoxNzQ1ODgzNzk3fQ.m0GMl6hkVN_P23EvMHYMNND0ZKHt-z9QX2tkUzy44XM', 6),
(42, '2025-04-29 00:56:55.000000', '2025-04-29 03:20:55.000000', b'1', 'eyJhbGciOiJIUzI1NiJ9.eyJpZFVzZXIiOjMsImZpcnN0TmFtZSI6IkRvZSIsImxhc3ROYW1lIjoiSm9obmFzIiwicHJvZmlsZVBpY3R1cmUiOiIvdXBsb2Fkcy8yNjQ5NmE4MS1lOTc1LTRiNDgtOGI3YS0yMDU1NTAzNGYzYjRfcG5nLXRyYW5zcGFyZW50LWJsYWNrLXNtYWxsLWFwcGxlLWxvZ28tbG9nby1tYXRlcmlhbC1hcHBsZS1sb2dvLWJsYWNrLXRodW1ibmFpbC5wbmciLCJyb2xlIjoiQURNSU4iLCJwaG9uZU51bWJlciI6NTQ1NTc4OTcsImdlbmRlciI6IkhvbW1lIiwiYmlydGhEYXRlIjo2MzA1MDA0MDAwMDAsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInN1YiI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NDU5Mjc4MTUsImV4cCI6MTc0NTkzNjQ1NX0.Rsji-aXVm5p2C9rOcyyeuwyJ3fPWv4PbjFOn_QCaSPE', 3);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` bigint(20) NOT NULL,
  `archived` bit(1) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `numero_de_telephone` int(11) DEFAULT NULL,
  `photo_profil` varchar(512) DEFAULT NULL,
  `sexe` enum('Autre','Femme','Homme') NOT NULL,
  `id_role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `archived`, `date_naissance`, `email`, `firstname`, `lastname`, `mot_de_passe`, `numero_de_telephone`, `photo_profil`, `sexe`, `id_role`) VALUES
(1, b'0', '2025-04-23', 'iskander.b@gmail.com', 'string', 'string', '$2a$10$Di18lxkrzgeL0llfjyEXruWk9aYMc5eZvx8.fIHRwbhFgcdjRKQkS', 0, '????', 'Homme', 1),
(2, b'0', '2025-04-23', 'iskander.bu@gmail.com', 'string', 'string', '$2a$10$IjuMOh2csOzYiBz05AjryukA0bkdd7qpaUyhmSu5QrroJew3vWJgu', 0, '????', 'Homme', 2),
(3, b'0', '1989-12-24', 'john@example.com', 'Johnas', 'Doe', '$2a$10$4nJefkyIKINFALazYaiJbu2cF2XKbCyTztRd7Hrvh1V87P1RqE966', 54557897, '/uploads/26496a81-e975-4b48-8b7a-20555034f3b4_png-transparent-black-small-apple-logo-logo-material-apple-logo-black-thumbnail.png', 'Homme', 1),
(5, b'0', '1989-12-31', 'iskander.bus@gmail.com', 'John', 'Doe', '$2a$10$z8BJTY3QIygYeAwMpygGRuDfr7TKzqriXHb4g0U0Xo/utmC4i0ByO', 1234567890, NULL, 'Homme', 1),
(6, b'0', '2024-09-26', 'iskander.456bahroun@gmail.com', 'iskander', 'Hiedout', '$2a$10$zUJJmvlC2Ss8ADkUk6.si.e5cgCBy5QN3bXJWvFEg7qkslX70tWkm', 58468797, '/uploads/07bbcf7f-2dca-4ca2-bf9c-5799676cd550_png-transparent-black-small-apple-logo-logo-material-apple-logo-black-thumbnail.png', 'Homme', 2),
(7, b'0', '2024-05-05', 'iskander.bser@gmail.com', 'root', 'iskander', '$2a$10$HVJgpxp1OWw0wngkCMZLu.ijZnlswHPlbhTTzKU1jZF/rN04yeWz2', 58689897, 'http://localhost:8080/uploads/b31a988b-14a0-4cde-982a-95f39bda7579_png-transparent-black-small-apple-logo-logo-material-apple-logo-black-thumbnail.png', 'Homme', 2),
(8, b'0', '2025-04-17', 'Iskander.bzet@gmail.com', 'bah', 'iskander', '$2a$10$ZrLlgAtZPhyYSvB9coih5.ZNw5VILugeP2NapU7BZlLelKkj4l57K', 848545846, 'http://localhost:8080/uploads/3ea0bff1-8991-4b81-a361-7665ad15c5a4_png-transparent-black-small-apple-logo-logo-material-apple-logo-black-thumbnail.png', 'Homme', 2),
(9, b'0', '2002-03-07', 'iskander.bh@esprit.tn', 'iskander', 'root', '$2a$10$/h226SUBiN1W2U4qUowvXuzeUZXYzwr6rVKF6oM3rAU6ekEVBrMLu', 54865487, 'http://localhost:8080/uploads/bd19a8a3-4faf-48a3-bb77-fe6761287701_png-transparent-black-small-apple-logo-logo-material-apple-logo-black-thumbnail.png', 'Homme', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcement`
--
ALTER TABLE `announcement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKmswt8gng4j4o92kt247e5srkf` (`club_id`);

--
-- Indexes for table `club_members`
--
ALTER TABLE `club_members`
  ADD KEY `FK9scuyhe9t6fbas7msgwev9aau` (`id`),
  ADD KEY `FK8xn6ret47a7tib2ql80cdxllk` (`club_id`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD KEY `FKhryx6nw9yts41qqpbjmspvb4x` (`user_id`),
  ADD KEY `FK9os563juo4kj34gnqr6ba12k9` (`event_id`);

--
-- Indexes for table `projet`
--
ALTER TABLE `projet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK91ott3fxubwahprq5a9q9yjmg` (`user_id`);

--
-- Indexes for table `projet_message`
--
ALTER TABLE `projet_message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKklppk35k2ma82up7ambn7fepj` (`projet_id`);

--
-- Indexes for table `projet_report`
--
ALTER TABLE `projet_report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK7wpwwjtgbvuhqfxe9p34nkqf5` (`projet_id`),
  ADD KEY `FK42idbi2yqi9bmk6ycqapr939c` (`user_id`),
  ADD KEY `FKmi604vjg9l6bsbgogyfnviis1` (`tache_id`);

--
-- Indexes for table `projet_tache`
--
ALTER TABLE `projet_tache`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKseh7atq0nlnyk6tpi3m2306cg` (`assignee_id`),
  ADD KEY `FKgk8163r4xs4l6u7bnw2dhm02u` (`projet_id`);

--
-- Indexes for table `reclamation`
--
ALTER TABLE `reclamation`
  ADD PRIMARY KEY (`id_reclamation`),
  ADD KEY `FKq17wjqej80k5a2849u8mcswb4` (`admin_id`),
  ADD KEY `FKu8yu5s8sa1mssjsduka59v5k` (`nuser_id`);

--
-- Indexes for table `report_participants`
--
ALTER TABLE `report_participants`
  ADD KEY `FKb4ib6ese96ug03d21c11s6pbm` (`user_id`),
  ADD KEY `FKpwrmx1r9ie84ytk6ejmmnpumm` (`report_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id_role`),
  ADD UNIQUE KEY `UK8nhufvk7ufr23s4xoqglqtbdx` (`role_type`);

--
-- Indexes for table `table-club`
--
ALTER TABLE `table-club`
  ADD PRIMARY KEY (`id_club`),
  ADD KEY `FKelwqbljew30m8qg1lwgc4kt7s` (`creator_id`);

--
-- Indexes for table `table-comment`
--
ALTER TABLE `table-comment`
  ADD PRIMARY KEY (`id_comment`),
  ADD KEY `FKa8gsglfjqy3329x6fi8ikf4f0` (`author_id`),
  ADD KEY `FKn0at0n7h8bnx8jy758o2j06ag` (`forum_post_id`);

--
-- Indexes for table `table-discussion`
--
ALTER TABLE `table-discussion`
  ADD PRIMARY KEY (`id_forum`),
  ADD KEY `FKr2864h93muuregs6n19u7l3l9` (`club_id`);

--
-- Indexes for table `table-event`
--
ALTER TABLE `table-event`
  ADD PRIMARY KEY (`id_event`),
  ADD KEY `FK4gvmvj3xwu6bbi61a4yk8cfbg` (`club_id`);

--
-- Indexes for table `table-forumpost`
--
ALTER TABLE `table-forumpost`
  ADD PRIMARY KEY (`id_post`),
  ADD KEY `FKfwykthsxg657edsbforht9nty` (`author_id`),
  ADD KEY `FKgt98371gr8vp29rk9ll6hh46a` (`discussion_id`);

--
-- Indexes for table `table-message`
--
ALTER TABLE `table-message`
  ADD PRIMARY KEY (`id_message`),
  ADD KEY `FK1jlgqf2idownaj3vgqqyj709m` (`auteur_id`),
  ADD KEY `FKpc6aid9mqy9nsqql1oyet02p3` (`project_id`),
  ADD KEY `FKehjxn9tw7skpjo19c837vbjwr` (`tache_id`);

--
-- Indexes for table `table-projet`
--
ALTER TABLE `table-projet`
  ADD PRIMARY KEY (`id_projet`),
  ADD KEY `FK1i0b72ab3eabi34324u27vahr` (`createur_id`);

--
-- Indexes for table `table-report`
--
ALTER TABLE `table-report`
  ADD PRIMARY KEY (`id_report`),
  ADD KEY `FKa8fyqoorsgujunbi4jk149o2n` (`project_id`),
  ADD KEY `FK7dinyexm835nrullghwx5ox27` (`reporter_id`),
  ADD KEY `FKbv89xrsdil1woabbi5ixsocna` (`tache_id`);

--
-- Indexes for table `table-tache`
--
ALTER TABLE `table-tache`
  ADD PRIMARY KEY (`id_tache`),
  ADD KEY `FKetgusn05kbg9ket9iknpquj6r` (`assignee_id`),
  ADD KEY `FK5a3g5g2yejv6ic0s4rk29kqd8` (`project_id`);

--
-- Indexes for table `token`
--
ALTER TABLE `token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKpddrhgwxnms2aceeku9s2ewy5` (`token`) USING HASH,
  ADD KEY `FKe32ek7ixanakfqsdaokm4q9y2` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `UKob8kqyqqgmefl0aco34akdtpe` (`email`),
  ADD KEY `FK6njoh3pti5jnlkowken3r8ttn` (`id_role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcement`
--
ALTER TABLE `announcement`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `projet`
--
ALTER TABLE `projet`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `projet_message`
--
ALTER TABLE `projet_message`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `projet_report`
--
ALTER TABLE `projet_report`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `projet_tache`
--
ALTER TABLE `projet_tache`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reclamation`
--
ALTER TABLE `reclamation`
  MODIFY `id_reclamation` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id_role` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `table-club`
--
ALTER TABLE `table-club`
  MODIFY `id_club` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `table-comment`
--
ALTER TABLE `table-comment`
  MODIFY `id_comment` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table-discussion`
--
ALTER TABLE `table-discussion`
  MODIFY `id_forum` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table-event`
--
ALTER TABLE `table-event`
  MODIFY `id_event` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table-forumpost`
--
ALTER TABLE `table-forumpost`
  MODIFY `id_post` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table-message`
--
ALTER TABLE `table-message`
  MODIFY `id_message` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table-projet`
--
ALTER TABLE `table-projet`
  MODIFY `id_projet` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table-report`
--
ALTER TABLE `table-report`
  MODIFY `id_report` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `table-tache`
--
ALTER TABLE `table-tache`
  MODIFY `id_tache` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `token`
--
ALTER TABLE `token`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcement`
--
ALTER TABLE `announcement`
  ADD CONSTRAINT `FKmswt8gng4j4o92kt247e5srkf` FOREIGN KEY (`club_id`) REFERENCES `table-club` (`id_club`);

--
-- Constraints for table `club_members`
--
ALTER TABLE `club_members`
  ADD CONSTRAINT `FK8xn6ret47a7tib2ql80cdxllk` FOREIGN KEY (`club_id`) REFERENCES `table-club` (`id_club`),
  ADD CONSTRAINT `FK9scuyhe9t6fbas7msgwev9aau` FOREIGN KEY (`id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `FK9os563juo4kj34gnqr6ba12k9` FOREIGN KEY (`event_id`) REFERENCES `table-event` (`id_event`),
  ADD CONSTRAINT `FKhryx6nw9yts41qqpbjmspvb4x` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `projet`
--
ALTER TABLE `projet`
  ADD CONSTRAINT `FK91ott3fxubwahprq5a9q9yjmg` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `projet_message`
--
ALTER TABLE `projet_message`
  ADD CONSTRAINT `FKklppk35k2ma82up7ambn7fepj` FOREIGN KEY (`projet_id`) REFERENCES `projet` (`id`);

--
-- Constraints for table `projet_report`
--
ALTER TABLE `projet_report`
  ADD CONSTRAINT `FK42idbi2yqi9bmk6ycqapr939c` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `FK7wpwwjtgbvuhqfxe9p34nkqf5` FOREIGN KEY (`projet_id`) REFERENCES `projet` (`id`),
  ADD CONSTRAINT `FKmi604vjg9l6bsbgogyfnviis1` FOREIGN KEY (`tache_id`) REFERENCES `projet_tache` (`id`);

--
-- Constraints for table `projet_tache`
--
ALTER TABLE `projet_tache`
  ADD CONSTRAINT `FKgk8163r4xs4l6u7bnw2dhm02u` FOREIGN KEY (`projet_id`) REFERENCES `projet` (`id`),
  ADD CONSTRAINT `FKseh7atq0nlnyk6tpi3m2306cg` FOREIGN KEY (`assignee_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `reclamation`
--
ALTER TABLE `reclamation`
  ADD CONSTRAINT `FKq17wjqej80k5a2849u8mcswb4` FOREIGN KEY (`admin_id`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `FKu8yu5s8sa1mssjsduka59v5k` FOREIGN KEY (`nuser_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `report_participants`
--
ALTER TABLE `report_participants`
  ADD CONSTRAINT `FKb4ib6ese96ug03d21c11s6pbm` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `FKpwrmx1r9ie84ytk6ejmmnpumm` FOREIGN KEY (`report_id`) REFERENCES `table-report` (`id_report`);

--
-- Constraints for table `table-club`
--
ALTER TABLE `table-club`
  ADD CONSTRAINT `FKelwqbljew30m8qg1lwgc4kt7s` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `table-comment`
--
ALTER TABLE `table-comment`
  ADD CONSTRAINT `FKa8gsglfjqy3329x6fi8ikf4f0` FOREIGN KEY (`author_id`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `FKn0at0n7h8bnx8jy758o2j06ag` FOREIGN KEY (`forum_post_id`) REFERENCES `table-forumpost` (`id_post`);

--
-- Constraints for table `table-discussion`
--
ALTER TABLE `table-discussion`
  ADD CONSTRAINT `FKr2864h93muuregs6n19u7l3l9` FOREIGN KEY (`club_id`) REFERENCES `table-club` (`id_club`);

--
-- Constraints for table `table-event`
--
ALTER TABLE `table-event`
  ADD CONSTRAINT `FK4gvmvj3xwu6bbi61a4yk8cfbg` FOREIGN KEY (`club_id`) REFERENCES `table-club` (`id_club`);

--
-- Constraints for table `table-forumpost`
--
ALTER TABLE `table-forumpost`
  ADD CONSTRAINT `FKfwykthsxg657edsbforht9nty` FOREIGN KEY (`author_id`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `FKgt98371gr8vp29rk9ll6hh46a` FOREIGN KEY (`discussion_id`) REFERENCES `table-discussion` (`id_forum`);

--
-- Constraints for table `table-message`
--
ALTER TABLE `table-message`
  ADD CONSTRAINT `FK1jlgqf2idownaj3vgqqyj709m` FOREIGN KEY (`auteur_id`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `FKehjxn9tw7skpjo19c837vbjwr` FOREIGN KEY (`tache_id`) REFERENCES `table-tache` (`id_tache`),
  ADD CONSTRAINT `FKpc6aid9mqy9nsqql1oyet02p3` FOREIGN KEY (`project_id`) REFERENCES `table-projet` (`id_projet`);

--
-- Constraints for table `table-projet`
--
ALTER TABLE `table-projet`
  ADD CONSTRAINT `FK1i0b72ab3eabi34324u27vahr` FOREIGN KEY (`createur_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `table-report`
--
ALTER TABLE `table-report`
  ADD CONSTRAINT `FK7dinyexm835nrullghwx5ox27` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id_user`),
  ADD CONSTRAINT `FKa8fyqoorsgujunbi4jk149o2n` FOREIGN KEY (`project_id`) REFERENCES `table-projet` (`id_projet`),
  ADD CONSTRAINT `FKbv89xrsdil1woabbi5ixsocna` FOREIGN KEY (`tache_id`) REFERENCES `table-tache` (`id_tache`);

--
-- Constraints for table `table-tache`
--
ALTER TABLE `table-tache`
  ADD CONSTRAINT `FK5a3g5g2yejv6ic0s4rk29kqd8` FOREIGN KEY (`project_id`) REFERENCES `table-projet` (`id_projet`),
  ADD CONSTRAINT `FKetgusn05kbg9ket9iknpquj6r` FOREIGN KEY (`assignee_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `token`
--
ALTER TABLE `token`
  ADD CONSTRAINT `FKe32ek7ixanakfqsdaokm4q9y2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK6njoh3pti5jnlkowken3r8ttn` FOREIGN KEY (`id_role`) REFERENCES `role` (`id_role`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
