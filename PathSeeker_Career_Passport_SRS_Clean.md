# PathSeeker - Software Requirements Specification

**Version:** 1.0\
**Theme:** Career Passport\
**Category:** Full-Stack Application Development\
**Application:** PathSeeker\
**Tagline:** Discover What Fits You Best...

------------------------------------------------------------------------

## Table of Contents

1.  [Background and Necessity for the Full-Stack Web
    Application](#11-background-and-necessity-for-the-full-stack-web-application)
2.  [Proposed Solution](#12-proposed-solution)
3.  [Purpose of the Document](#13-purpose-of-the-document)
4.  [Scope of the Project](#14-scope-of-the-project)
5.  [Constraints](#15-constraints)
6.  [Functional Requirements](#16-functional-requirements)
7.  [Non-Functional Requirements](#17-non-functional-requirements)
8.  [Interface Requirements](#18-interface-requirements)
    -   [Hardware](#hardware)
    -   [Software](#software)
    -   [Database Design](#database-design)
9.  [Project Deliverables](#19-project-deliverables)

------------------------------------------------------------------------

## 1.1 Background and Necessity for the Full-Stack Web Application

In today's competitive world, students, graduates, and professionals
often struggle to choose career paths that align with their skills and
interests. Existing resources are either too generic, difficult to
navigate, or not tailored to individual user requirements.

There is a growing demand for a fully functional, interactive web
application that simplifies career exploration and personalizes
guidance. An application is required to fulfill this demand by offering
a dynamic and responsive platform which provides:

-   Tailored career options based on user type
-   Interest-based quizzes and recommendations
-   Multimedia learning and downloadable resources

Built with modern front-end technologies and static data files, it
should ensure seamless performance even without backend support, making
it ideal for institutions, individuals, and offline-ready deployment.

## 1.2 Proposed Solution

To address the gap in accessible, personalized career guidance, the
proposed solution is the development of a fully functional web
application named **PathSeeker**, a responsive, interactive Career
Passport platform designed for students, graduates, and working
professionals.

The application offers a seamless user experience by segmenting content
based on the user's academic or professional stage. Each user type is
guided through tailored career paths using intuitive UI, interactive
tools, and visual aids after they have registered and logged in.

## 1.3 Purpose of the Document

This document presents a detailed description of the PathSeeker
application, explaining its features, purpose, scope, and limitations.
It is intended for both stakeholders and developers of the application.

## 1.4 Scope of the Project

PathSeeker is a full-stack web application designed to guide students,
graduates, and working professionals in making informed career
decisions.

It offers a personalized experience through:

-   User registration and login
-   An interest-based quiz
-   A dynamic career bank comprising global job roles
-   A customizable dashboard
-   Backend-supported data storage
-   User session management
-   Feedback submission
-   Content updates
-   Career exploration
-   Resource bookmarking
-   Expert videos
-   Downloadable career materials

The platform should be scalable, responsive, and adaptable for
institutions, career fairs, and personal use, offering an interactive
Career Passport solution.

Administrative functionality will also be part of the application,
providing control over features including user management.

### Architecture

The specified architecture consists of:

1.  Users accessing PathSeeker through a web browser
2.  HTTP communication with a web server
3.  An application instance handling web processing
4.  A database used for persistent application data

### Application Flow

PathSeeker serves three primary user groups:

-   Student
-   Graduate
-   Working Professional

Core application areas include:

-   User Registration
-   Career Bank
-   Multimedia and Resources
-   User Dashboard
-   Bookmarking and Notes
-   Feedback
-   Interest Quiz

The administrator manages the PathSeeker web application and can add,
edit, or remove:

-   Career profiles
-   Multimedia content
-   Quiz questions and scoring logic
-   User feedback and success stories

The administrator can also view usage statistics such as active users,
quiz attempts, and popular content, along with other administrative
functionality.

## 1.5 Constraints

Development of the PathSeeker web application must adhere to several
constraints to ensure successful implementation and operation.

-   The application must be compatible with major web browsers.
-   The application must be responsive across various devices.
-   Data storage, synchronization, and backup procedures may introduce
    technical constraints.
-   Images and videos may be subject to licensing agreements and
    copyright restrictions.
-   The application will not perform actual validation of submitted
    resumes or other submitted data.
-   Payment gateway functionality is outside the scope of the
    application.

## 1.6 Functional Requirements

PathSeeker will offer a complete, role-based career exploration
experience with dynamic frontend features and robust backend support. It
should cover essential functionality and advanced capabilities for
personalization, scalability, and interactivity.

### User Authentication and Management

-   Role-based registration and login for:
    -   Student
    -   Graduate
    -   Professional
-   Admin has direct access to the login feature.
-   Secure session management.
-   Forgot password and reset password functionality.
-   Email verification through a One-Time Password (OTP) or tokenized
    link.
-   User profile creation with editable:
    -   Education
    -   Skills
    -   Interests
    -   Work experience, where applicable
-   Optional resume upload functionality.

### Personalized Dashboard

-   Display a personalized greeting.
-   Display recent activity.
-   Display quiz results.
-   Display bookmarked items.
-   Recommend careers, content, and videos based on user interaction
    history.
-   Display dynamic widgets such as:
    -   Trending Careers
    -   Top Picks for You

### Career Bank with Advanced Filters

-   Fetch and display careers and job roles from a backend database.
-   Support multi-level filtering based on:
    -   Domain
    -   Skill match
    -   Expected salary
    -   Job demand
-   Provide smart search with autocomplete and spell-check using
    Elasticsearch or a similar technology.
-   Allow users to save search filters and preferences, such as
    displaying only technology or healthcare roles.

### AI-Powered Interest Quiz (Optional)

AI tools may be used to prepare quiz questions with the following
features:

-   Multi-step quiz.
-   Timed questions.
-   Sliders.
-   Likert-scale ratings.
-   Quiz history stored for progress tracking.
-   Automatic suggestions for streams and job roles based on:
    -   Current trends
    -   User performance in the quiz

### Interactive Multimedia Center

-   Stream embedded videos.
-   Stream audio podcasts.
-   Display animated explainers.
-   Provide a video player with:
    -   Transcript toggle
    -   Playback controls
    -   Related content suggestions
-   Admin-controlled tagging and categorization.
-   User feedback and rating on videos using:
    -   5-star ratings, or
    -   Thumbs-up/down ratings

### Success Stories Hub

-   Card-based success stories.
-   Domain-based filtering.
-   Timeline-style storytelling covering:
    -   Educational path
    -   Challenges
    -   Outcome
-   Allow users to submit their own success stories.
-   User-submitted stories require admin approval.

### Document Resource Library

-   Downloadable PDFs, checklists, and infographics.
-   Group resources by type and target audience.
-   Provide automatic document previews using popups or modals.
-   Backend-driven tagging, for example:
    -   Beginner
    -   Scholarship
    -   Skill-Building
-   Allow admins to track download count and popularity.

### Feedback and Analytics

-   Dynamic feedback form with categories such as:
    -   Bug
    -   Suggestion
    -   Query
-   Admin dashboard for feedback analytics, including:
    -   Sentiment summary
    -   Response type statistics
-   In-app notification center for feedback responses or announcements.

### Bookmarking, Notes, and Sharing

-   Bookmark any career, article, or video.
-   Add sticky notes or comments to bookmarks.
-   Export notes and bookmarks as PDF.
-   Share through email or social media.
-   Automatically suggest similar careers or content based on bookmarks.

### Admin Control Panel

Administrators can add, edit, or remove:

-   Career profiles
-   Multimedia content
-   Quiz questions and scoring logic
-   User feedback
-   Success stories

Administrators can view usage statistics including:

-   Active users
-   Quiz attempts
-   Popular content

### System Intelligence (Advanced UX)

-   Recently viewed item history with session and persistent storage.
-   Predictive analytics for career trends using stored data (optional).
-   Dynamic recommendations based on collaborative filtering or
    interaction behaviour.
-   "If you liked this..." suggestion engine for content and careers.

### Accessibility and UI Enhancements

-   Dark mode toggle.
-   Font-size adjustment for accessibility.
-   Breadcrumbs for navigation clarity.
-   Smooth transitions.
-   Loading spinners for media.

### Implementation Notes

> Boilerplate or readymade HTML templates may be used only for the
> design aspect and not for implementing application functionality.

> Do not copy content or code from GPTs or other AI tools. AI-generated
> images are permitted for visual representation, but any AI tools used
> to generate images must be disclosed.

## 1.7 Non-Functional Requirements

The application must satisfy the following non-functional requirements:

### Safe to Use

The application should not result in malicious downloads or unnecessary
file downloads.

### Accessibility

The application should have clear and legible fonts, user-interface
elements, and navigation elements.

### User-Friendliness

The application should be easy to navigate, with clear menus and
understandable interface elements.

### Operability

The application should be reliable and efficient.

### Performance

The application should demonstrate strong performance through speed and
throughput, including minimal load time and smooth page redirection.

### Scalability

The application architecture and infrastructure should be designed to
handle increasing:

-   User traffic
-   Data storage
-   Feature expansion

### Security

The application should implement adequate security measures such as
authentication. Certain features should be accessible only to registered
users.

### Availability

The application should be available 24/7 with minimum downtime.

### Compatibility

The application should be compatible with current browsers and various
devices.

> These are the bare minimum expectations for the project. The
> functional and non-functional requirements in this SRS must be
> implemented. Additional features may be added after the required
> functionality is complete.

## 1.8 Interface Requirements

### Hardware

-   Intel Core i5/i7 processor or higher
-   8 GB RAM or higher
-   Color SVGA monitor
-   500 GB hard disk space
-   Mouse
-   Keyboard

### Software

**IDE**

-   Appropriate IDE for the selected platform

**Frontend**

-   HTML5
-   CSS3
-   Bootstrap
-   ReactJS / AngularJS / Angular / TypeScript
-   JavaScript
-   jQuery
-   XML

**Backend - supported options**

Choose an appropriate backend stack from the specified options:

1.  Java SDK with Apache NetBeans or Eclipse and Jakarta EE
2.  C# with ASP.NET MVC / ASP.NET MVC Core (optional) and Visual Studio
3.  PHP with Laravel Framework
4.  Python with Flask or Django
5.  MongoDB, Express.js, Angular, Node.js
6.  MongoDB, Express.js, React, Node.js

**Database**

-   MySQL, or
-   SQL Server

**Local Hosting (Optional)**

-   Latest version of XAMPP

### Database Design

Suitable entities, attributes, and relationships should be defined based
on the application requirements.

The SRS provides the following example entities and attributes. These
structures are examples and may be changed.

#### Admins

  Attribute         Description
  ----------------- -----------------
  `admin_id`        Primary Key
  `name`            Admin name
  `email`           Admin email
  `password_hash`   Hashed password

#### Careers

  Attribute           Description
  ------------------- --------------------
  `career_id`         Primary Key
  `title`             Career title
  `description`       Career description
  `domain`            Career domain
  `required_skills`   Required skills
  `education_path`    Education path
  `expected_salary`   Expected salary

#### Users

  Attribute         Description
  ----------------- -----------------------------------
  `user_id`         Primary Key
  `uname`           Username
  `email`           Unique email
  `password_hash`   Hashed password
  `role`            Student / Graduate / Professional

#### Resources

  Attribute       Description
  --------------- ----------------------
  `resource_id`   Primary Key
  `title`         Resource title
  `category`      Resource category
  `description`   Resource description
  `file_url`      Resource file URL
  `tag`           Resource tag
  `views_count`   Number of views
  `created_by`    Foreign Key

#### SuccessStories

  Attribute        Description
  ---------------- --------------------
  `story_id`       Primary Key
  `rname`          Name
  `domain`         Domain
  `story_text`     Story content
  `image_url`      Image URL
  `submitted_by`   Foreign Key
  `approved_by`    Foreign Key
  `approved_at`    Approval timestamp

#### UserProfiles

  Attribute           Description
  ------------------- -----------------------
  `profile_id`        Primary Key
  `user_id`           Foreign Key
  `education_level`   Education level
  `interests`         User interests
  `profile_image`     Profile image
  `updated_at`        Last update timestamp

#### Multimedia

  Attribute        Description
  ---------------- -------------------
  `media_id`       Primary Key
  `title`          Media title
  `type`           Media type
  `url`            Media URL
  `tags`           Media tags
  `transcript`     Transcript
  `rating_avg`     Average rating
  `rating_count`   Number of ratings

#### QuizQuestions

  Attribute          Description
  ------------------ -------------------
  `question_id`      Primary Key
  `question_text`    Question text
  `type`             Question type
  `options`          Available options
  `correct_answer`   Correct answer
  `weightage`        Question weight

#### Feedback

  Attribute        Description
  ---------------- ----------------------
  `feedback_id`    Primary Key
  `user_id`        Foreign Key
  `category`       Feedback category
  `message`        Feedback message
  `status`         Feedback status
  `submitted_at`   Submission timestamp

Other entities, relationships, and methods representing activities on
the entities may be defined as required.

> The database structures above are examples. You do not have to adhere
> to them and may design your own table structure with different
> columns.

## 1.9 Project Deliverables

The project must be designed, built, and submitted with a complete
project report containing:

-   Problem Definition
-   Design Specifications
-   Diagrams such as:
    -   Flowcharts for various activities
    -   Data Flow Diagrams
    -   Other relevant diagrams
-   Database Design
-   Test Data Used in the Project
-   Project Installation Instructions **(mandatory)**
-   User Credentials for all Types of Users with Passwords

Documentation is an important part of the project and must be complete
and comprehensive.

**Documentation must not contain source code.**

The consolidated project must be submitted as a ZIP file containing:

-   A `ReadMe.doc` file listing assumptions, if any
-   SQL script files (`.sql`) or schema files containing database and
    table definitions

Preferably, the working web application should be hosted on a website
and its URL shared for evaluation.

A video (`.mp4`) demonstrating the working web application, including
**all features under Functional Requirements, is mandatory**.

Additional creativity and logic may be applied beyond the given
specifications to improve the system.

### Sitemap

A sitemap must be created to demonstrate the flow of the PathSeeker web
application and added to the application's home page.

------------------------------------------------------------------------

*Source: Aptech Limited - Software Requirements Specification, Version
1.0.*
