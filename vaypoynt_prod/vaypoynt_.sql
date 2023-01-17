

  SET NAMES utf8;
  SET time_zone = '+00:00';
  SET foreign_key_checks = 0;
  SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

  SET NAMES utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_cancel_pending_request;
  CREATE TABLE vaypoynt_cancel_pending_request (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `user_id`  varchar(255)     
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_room;
  CREATE TABLE vaypoynt_room (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `user_id`  int(11) NOT NULL    , `other_user_id`  int(11) NOT NULL    , `chat_id`  int(11) NOT NULL    , `unread`  int(11) NOT NULL   DEFAULT 0 , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `user_update_at`  datetime NOT NULL    , `other_user_update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_order;
  CREATE TABLE vaypoynt_stripe_order (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `user_id`  int(11) NOT NULL    , `price_id`  int(11) NOT NULL    , `stripe_id`  varchar(255) NOT NULL    , `object`  longtext NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_product;
  CREATE TABLE vaypoynt_stripe_product (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `name`  varchar(255) NOT NULL    , `stripe_id`  varchar(255) NOT NULL    , `object`  longtext NOT NULL    , `status`  tinyint(1) NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_trigger_rules;
  CREATE TABLE vaypoynt_trigger_rules (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `name`  text NOT NULL    , `event_type`  varchar(255) NOT NULL   DEFAULT '' , `trigger_type`  varchar(255) NOT NULL    , `condition`  text NOT NULL    , `condition_payload`  text NOT NULL    , `result_true`  text NOT NULL    , `result_payload`  text NOT NULL    , `status`  int(11) NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_user;
  CREATE TABLE vaypoynt_user (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `oauth`  varchar(255)     , `role`  varchar(255)     , `first_name`  varchar(255)     , `last_name`  varchar(255)     , `email`  varchar(255)  UNIQUE KEY   , `password`  varchar(255)     , `type`  int(11)     , `verify`  int(11)     , `phone`  varchar(255)     , `photo`  text     , `refer`  varchar(255)     , `stripe_uid`  varchar(255)     , `paypal_uid`  varchar(255)     , `two_factor_authentication`  int(11)     , `status`  int(11)     , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_token;
  CREATE TABLE vaypoynt_token (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `token`  text NOT NULL    , `type`  int(11) NOT NULL    , `data`  text NOT NULL    , `user_id`  int(11) NOT NULL    , `status`  int(11) NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `expire_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_subscription;
  CREATE TABLE vaypoynt_stripe_subscription (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `stripe_id`  varchar(255) NOT NULL    , `price_id`  varchar(255) NOT NULL    , `user_id`  int(11) NOT NULL    , `object`  longtext NOT NULL    , `status`  varchar(50) NOT NULL    , `is_lifetime`  tinyint(1)     , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_teams_pending_request;
  CREATE TABLE vaypoynt_teams_pending_request (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `company_id`  int(11)     , `employee_id`  int(11)     , `employee_name`  varchar(255)     , `employee_email`  varchar(255)     
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_photo;
  CREATE TABLE vaypoynt_photo (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `url`  text     , `caption`  text     , `user_id`  int(11)     , `width`  int(11)     , `height`  int(11)     , `type`  int(11)     , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_setting;
  CREATE TABLE vaypoynt_stripe_setting (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `key`  varchar(50) NOT NULL UNIQUE KEY   , `value`  mediumtext NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_trigger_type;
  CREATE TABLE vaypoynt_trigger_type (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `name`  text NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_email;
  CREATE TABLE vaypoynt_email (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `slug`  varchar(255)     , `subject`  text     , `tag`  text     , `html`  text     , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_department_pending_assignment;
  CREATE TABLE vaypoynt_department_pending_assignment (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `employee_id`  int(11) NOT NULL    , `company_id`  int(11) NOT NULL    , `department_id`  int(11) NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_checkout;
  CREATE TABLE vaypoynt_stripe_checkout (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `user_id`  int(11) NOT NULL    , `stripe_id`  varchar(255) NOT NULL    , `object`  longtext NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_webhook;
  CREATE TABLE vaypoynt_stripe_webhook (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `stripe_id`  varchar(255)     , `idempotency_key`  varchar(255)     , `description`  varchar(255)     , `event_type`  varchar(255)     , `resource_type`  varchar(255)     , `object`  longtext NOT NULL    , `is_handled`  tinyint(1)     , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_price;
  CREATE TABLE vaypoynt_stripe_price (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `name`  varchar(255) NOT NULL    , `product_id`  int(11) NOT NULL    , `stripe_id`  varchar(255) NOT NULL    , `is_usage_metered`  tinyint(1)     , `usage_limit`  int(11)     , `object`  longtext NOT NULL    , `amount`  float NOT NULL    , `trial_days`  int(11)     , `type`  varchar(50) NOT NULL    , `status`  tinyint(1) NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_analytic_log;
  CREATE TABLE vaypoynt_analytic_log (
     `id`  bigint(20) NOT NULL PRIMARY KEY auto_increment  , `user_id`  int(11)     , `url`  text     , `path`  text     , `hostname`  text     , `ip`  varchar(50)     , `role`  varchar(50)     , `browser`  varchar(255)     , `country`  varchar(100)     , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_company_profile;
  CREATE TABLE vaypoynt_company_profile (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `user_id`  varchar(255)     , `first_name`  varchar(255)     , `last_name`  varchar(255)     , `email`  varchar(255)     , `company_logo`  longtext     , `address`  varchar(255)     , `company_name`  varchar(255)     , `recovery_email`  varchar(255)     , `teams_id`  varchar(255)     , `teams_name`  varchar(255)     , `cancel_request`  varchar(255)     
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_stripe_invoice;
  CREATE TABLE vaypoynt_stripe_invoice (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `user_id`  int(11) NOT NULL    , `stripe_id`  varchar(255) NOT NULL    , `object`  longtext NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_desk_ticket;
  CREATE TABLE vaypoynt_desk_ticket (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `user_id`  int(11)     , `floor`  int(11)     , `section`  varchar(255)     , `start`  int(11)     , `end`  int(11)     , `status`  int(11)     
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_department;
  CREATE TABLE vaypoynt_department (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `name`  varchar(255)     , `company_id`  int(11)     
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_permission;
  CREATE TABLE vaypoynt_permission (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `role`  varchar(255) NOT NULL   DEFAULT '' , `permission`  text NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_profile;
  CREATE TABLE vaypoynt_profile (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `user_id`  int(11) NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_cms;
  CREATE TABLE vaypoynt_cms (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `page`  varchar(255) NOT NULL    , `content_key`  varchar(255) NOT NULL    , `content_type`  varchar(255) NOT NULL    , `content_value`  text NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_chat;
  CREATE TABLE vaypoynt_chat (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `room_id`  int(11)     , `unread`  int(11)     , `chat`  longtext NOT NULL    , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_employee_profile;
  CREATE TABLE vaypoynt_employee_profile (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `user_id`  int(11)     , `first_name`  varchar(255)     , `last_name`  varchar(255)     , `company_id`  int(11)     , `title`  varchar(255)     , `department_id`  int(11)     , `floor`  int(11)     , `address`  varchar(255)     , `profile_photo`  longtext     , `email`  varchar(255)     , `phone`  varchar(255)     , `teams_id`  varchar(255)     , `teams_name`  varchar(255)     , `slack_username`  varchar(255)     , `teams_status`  varchar(255)     
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  

  DROP TABLE IF EXISTS vaypoynt_desk_hotelling;
  CREATE TABLE vaypoynt_desk_hotelling (
     `id`  int(11) NOT NULL PRIMARY KEY auto_increment  , `create_at`  date NOT NULL    , `update_at`  datetime NOT NULL    , `floor`  int(11)     , `user_id`  int(11)     , `start_time`  datetime     , `end_time`  datetime     , `desk_number`  int(11)     , `status_type`  int(11)     , `company_id`  int(11)     , `department_id`  int(11)     
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  