CREATE TABLE `todos` (
  `todo` text,
  `user` text,
  `date_made` text,
  `date_deleted` text,
  `id` text
);

CREATE TABLE `users` (
  `username` text,
  `email` text,
  `password` text,
  `age` int(11) DEFAULT NULL,
  `email_verify` tinyint(1) DEFAULT '0',
  `id` text
);