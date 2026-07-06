-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 06, 2026 at 04:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_quotation`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_logs`
--

CREATE TABLE `ai_logs` (
  `ID` int(11) NOT NULL,
  `sUserRequest` text NOT NULL,
  `sAIResponse` text NOT NULL,
  `dtCreatedOn` datetime NOT NULL,
  `iQuotationAdded` int(11) NOT NULL COMMENT '0-Not Added/1 -Added',
  `iQuotationId` int(11) NOT NULL,
  `iCreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `ID` int(11) NOT NULL,
  `sClientName` varchar(500) NOT NULL,
  `sCompanyName` varchar(300) NOT NULL,
  `sEmail` varchar(250) NOT NULL,
  `sPhoneNumber` varchar(250) NOT NULL,
  `sNotes` text NOT NULL,
  `iStatus` int(11) NOT NULL,
  `dtCreatedOn` datetime DEFAULT NULL,
  `iCreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loginuserwisetokenauthentication`
--

CREATE TABLE `loginuserwisetokenauthentication` (
  `ID` int(11) NOT NULL,
  `iUserId` int(11) NOT NULL,
  `sUserName` varchar(200) NOT NULL,
  `sToken` text NOT NULL,
  `dtCreatedOn` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `ID` int(11) NOT NULL,
  `iClientId` int(11) NOT NULL,
  `sQuotationNumber` varchar(100) NOT NULL,
  `sTitle` varchar(300) NOT NULL,
  `fTotalAmount` float(10,3) NOT NULL,
  `sDescription` text NOT NULL,
  `iStatus` int(11) NOT NULL COMMENT '0-Draft/1-Sent/2-Approved/3-Reject',
  `dtQuotationDate` datetime DEFAULT NULL,
  `dtCreatedOn` datetime DEFAULT NULL,
  `iCreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotation_details`
--

CREATE TABLE `quotation_details` (
  `ID` int(11) NOT NULL,
  `iQuotationId` int(11) NOT NULL,
  `sTitle` varchar(250) NOT NULL,
  `sDescription` text NOT NULL,
  `fQuantity` float(10,2) NOT NULL,
  `fUnitPrice` float(10,3) NOT NULL,
  `fTotalPrice` float(10,3) NOT NULL,
  `dtCreatedOn` datetime DEFAULT NULL,
  `iCreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `sUserName` varchar(250) NOT NULL,
  `sPassword` varchar(300) NOT NULL,
  `sMobile` varchar(100) NOT NULL,
  `sEmail` varchar(100) NOT NULL,
  `iStatus` int(11) NOT NULL,
  `dtCreatedOn` datetime DEFAULT NULL,
  `iCreatedBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `sUserName`, `sPassword`, `sMobile`, `sEmail`, `iStatus`, `dtCreatedOn`, `iCreatedBy`) VALUES
(1, 'admin@quotation.com', '$2b$10$iQHzPAhBciW2jR6ecjw.v.SfTKaRSXGEphm6Ar42s2ly8BotmE5Ry', '12345678', 'admin@quotation.com', 1, '2026-07-02 23:25:59', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_logs`
--
ALTER TABLE `ai_logs`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `loginuserwisetokenauthentication`
--
ALTER TABLE `loginuserwisetokenauthentication`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `quotation_details`
--
ALTER TABLE `quotation_details`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_logs`
--
ALTER TABLE `ai_logs`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loginuserwisetokenauthentication`
--
ALTER TABLE `loginuserwisetokenauthentication`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotation_details`
--
ALTER TABLE `quotation_details`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
