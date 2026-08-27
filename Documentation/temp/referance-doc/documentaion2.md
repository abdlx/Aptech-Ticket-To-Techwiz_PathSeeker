---
authentication: Firebase Auth
backend: Firebase
database: Firebase Firestore
document_type: AI-optimized technical documentation
frontend: Flutter 3.8.1+, Material Design 3
images_removed: true
platform: Flutter mobile and web application
project: PetCare
source: Documentation2.pdf
source_last_updated: December 2023
state_management: Provider / ChangeNotifier
storage: Firebase Storage
title: PetCare - Complete Technical Documentation
version: 1.0.0
---

# PetCare - Complete Technical Documentation

## 0. Document Purpose

This document is a clean, text-first representation of the PetCare
project documentation. Visual-only presentation pages, screenshots,
decorative graphics, and repeated screenshot walkthrough pages have been
removed. Information conveyed by diagrams has been converted into
structured text where it is legible in the source.

PetCare is a Flutter-based mobile and web application for pet owners,
veterinarians, shelter owners, and administrators. The platform
centralizes pet management, veterinary appointments, adoption workflows,
health records, and pet-product shopping.

## 1. Problem Definition

### 1.1 Problem Statement

The pet care industry faces significant challenges in managing
comprehensive pet health, facilitating adoptions, and connecting pet
owners with veterinary services. Traditional methods are fragmented.

Primary problems identified by the source documentation:

-   **Fragmented pet management:** Pet owners struggle to maintain
    comprehensive health records and track appointments across different
    veterinarians.
-   **Limited adoption visibility:** Shelters have difficulty showcasing
    available pets and managing adoption processes efficiently.
-   **Poor communication:** There is no integrated communication layer
    connecting pet owners, veterinarians, and shelters.
-   **Inefficient appointment scheduling:** Manual appointment-booking
    processes create scheduling conflicts and a poor user experience.
-   **Limited access to pet products:** Pet owners need convenient
    access to quality pet products and supplies.
-   **Lack of success tracking:** There is no centralized system for
    tracking successful adoptions and sharing success stories.

### 1.2 Solution Overview

PetCare is a comprehensive Flutter-based mobile and web application
providing an integrated platform for pet care.

#### Unified Pet Management

-   Centralized pet profiles.
-   Complete health history.
-   Vaccination records.
-   Medical documentation.
-   Health tracking records.

#### Streamlined Adoption Process

-   Digital pet listings.
-   Automated adoption-request management.
-   Adoption workflow support.
-   Success-story tracking.
-   Adoption automation.

#### Integrated Appointment System

-   Real-time appointment booking.
-   Automated reminders.
-   Veterinarian availability management.
-   Scheduling reminders.

#### E-commerce Integration

-   In-app pet-product store.
-   Personalized recommendations.
-   Secure payment processing.
-   Pet-product browsing and purchasing.

### 1.3 Target Users

#### Pet Owners

Individuals who own pets and need:

-   Pet-health management.
-   Appointment booking.
-   Product purchasing.
-   Pet-profile management.
-   Adoption browsing and applications.

#### Veterinarians

Medical professionals providing pet healthcare services.

#### Shelter Owners

Organizations or operators managing pet shelters and adoption processes.

#### Administrators

System administrators responsible for managing the platform.

------------------------------------------------------------------------

## 2. Design Specifications

### 2.1 Functional Requirements

#### 2.1.1 Pet Owner Features

-   **Pet Registration:** Add and manage multiple pet profiles with
    detailed information.
-   **Health Tracking:** Monitor pet health status, vaccination
    schedules, and medical history.
-   **Appointment Booking:** Schedule and manage veterinary appointments
    with automated reminders.
-   **Product Shopping:** Browse and purchase pet products with secure
    payment integration.
-   **Adoption Browsing:** View available pets and submit adoption
    applications.
-   **Health Records:** Access complete digital medical history and
    reports.

#### 2.1.2 Veterinarian Features

-   **Patient Management:** View and manage patient information and
    medical records.
-   **Appointment Scheduling:** Manage appointment calendars and set
    availability.
-   **Health Record Creation:** Create, update, and maintain medical
    records.
-   **Prescription Management:** Issue and track prescriptions
    digitally.
-   **Patient Search:** Advanced search and filtering of patient
    records.

#### 2.1.3 Shelter Owner Features

The document index names a dedicated Shelter Owner feature section, but
the supplied PDF does not provide a separate textual requirements list
for it. Shelter-owner behavior documented elsewhere includes:

-   Manage pet listings.
-   Receive and review adoption requests.
-   Participate in the adoption-review process.
-   Approve adoption requests.
-   Manage adoption completion.
-   Track and expose adoption success stories.

#### 2.1.4 Administrator Features

The document index names a dedicated Administrator feature section, but
the supplied PDF does not provide a separate textual requirements list.
Administrators are defined as users who manage the platform, and the
architecture diagram associates administrators with system data and
analytics.

### 2.2 Non-Functional Requirements

#### 2.2.1 Performance Requirements

-   **Response Time:** Less than 2 seconds for all user interactions and
    data loading.
-   **Concurrent Users:** Support up to 10,000 concurrent users without
    performance degradation.
-   **Data Processing:** Real-time data synchronization across all
    clients.
-   **Image Loading:** Optimized image loading using caching and
    compression.

#### 2.2.2 Security Requirements

-   **Authentication:** Secure user authentication using Firebase Auth
    and multi-factor authentication.
-   **Authorization:** Role-based access control with granular
    permissions.
-   **Data Encryption:** Sensitive data encrypted in transit and at
    rest.
-   **Input Validation:** Comprehensive input validation and
    sanitization.

#### 2.2.3 Usability Requirements

A dedicated usability section appears in the document index, but no
standalone textual usability-requirements section is present in the
supplied PDF. The documented UI technology is Material Design 3, with a
cross-platform Flutter interface.

#### 2.2.4 Scalability Requirements

A dedicated scalability section appears in the document index, but no
standalone textual scalability-requirements section is present in the
supplied PDF. Related documented targets include 10,000 concurrent
users, real-time Firestore synchronization, Firebase Storage, and
optimized image delivery.

------------------------------------------------------------------------

## 3. System Architecture

### 3.1 High-Level Architecture

The high-level architecture diagram organizes PetCare into three layers.

### Presentation Layer - Flutter UI

Interfaces:

-   Pet Owner Interface.
-   Veterinarian Interface.
-   Shelter Owner Interface.
-   Admin Interface.

### Business Logic Layer - Services

Services shown in the architecture:

-   `AuthService`
-   `PetService`
-   `AppointmentService`
-   `StoreService`
-   `AnalyticsService`
-   `NotificationService`

### Data Access Layer - Firebase

Firebase components:

-   Firebase Firestore.
-   Firebase Storage.
-   Firebase Authentication.
-   Firebase Messaging.

### Architecture Flow

``` text
Users
  |
  v
Flutter Presentation Layer
  |
  v
Business Logic / Service Layer
  |
  v
Firebase Data Access Layer
```

### 3.2 Technology Stack

#### 3.2.1 Frontend Technologies

**Framework**

-   Flutter 3.8.1+.
-   Cross-platform mobile and web development.

**State Management**

-   Provider pattern.
-   Intended for efficient state management and data flow.

**UI Framework**

-   Material Design 3.
-   Consistent, modern, responsive user interface.

#### 3.2.2 Backend Technologies

**Database**

-   Firebase Firestore.
-   NoSQL.
-   Real-time data synchronization.

**Authentication**

-   Firebase Auth.
-   Secure authentication and authorization.
-   Source documentation labels this area "Secure OAuth."

**Storage**

-   Firebase Storage.
-   Scalable file and image storage.
-   CDN-oriented delivery is referenced by the source.

#### 3.2.3 Development Tools

The document index contains a Development Tools subsection, but the
supplied PDF does not provide a standalone textual list of development
tools.

------------------------------------------------------------------------

## 4. Database Design

### 4.1 Firebase Firestore Collections

The document index names the following collections:

1.  Users.
2.  Pets.
3.  Appointments.
4.  Pet Listings.
5.  Store Items.
6.  Adoption Requests.

The PDF provides explicit field schemas for Users, Pets, and
Appointments. Pet Listings, Store Items, and Adoption Requests are
referenced in relationships and workflows but do not have explicit field
schemas in the supplied text.

### 4.1.1 Users Collection

``` json
{
  "users": {
    "userId": {
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "phoneNumber": "string",
      "role": "petOwner|veterinarian|shelterAdmin|shelterOwner|admin",
      "profileImageUrl": "string",
      "bio": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "isActive": "boolean",
      "clinicName": "string",
      "licenseNumber": "string",
      "shelterName": "string",
      "address": "string"
    }
  }
}
```

Role-specific fields documented by the source:

-   `clinicName`: for veterinarians.
-   `licenseNumber`: for veterinarians.
-   `shelterName`: for shelter owners.

### 4.1.2 Pets Collection

``` json
{
  "pets": {
    "petId": {
      "ownerId": "string",
      "name": "string",
      "species": "dog|cat|bird|rabbit|hamster|fish|reptile|other",
      "breed": "string",
      "gender": "male|female|unknown",
      "dateOfBirth": "timestamp",
      "weight": "number",
      "color": "string",
      "microchipId": "string",
      "photoUrls": ["string"],
      "healthStatus": "healthy|sick|recovering|critical|unknown",
      "medicalNotes": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "isActive": "boolean"
    }
  }
}
```

### 4.1.3 Appointments Collection

The source spells the veterinarian field as `veterinariainId` in the
schema, while later security rules use `veterinarianId`. Both are
preserved here because they appear differently in the original
documentation.

``` json
{
  "appointments": {
    "appointmentId": {
      "petOwnerId": "string",
      "veterinariainId": "string",
      "petId": "string",
      "appointmentDate": "timestamp",
      "status": "scheduled|confirmed|completed|cancelled",
      "reason": "string",
      "notes": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
}
```

### 4.1.4 Pet Listings Collection

Referenced by the document index, database relationships, adoption
flows, and shelter-owner UI. No explicit field schema is provided in the
supplied PDF.

### 4.1.5 Store Items Collection

Referenced by the document index and e-commerce functionality. No
explicit field schema is provided in the supplied PDF.

### 4.1.6 Adoption Requests Collection

Referenced by the document index, database relationships, and adoption
flow. No explicit field schema is provided in the supplied PDF.

### 4.2 Database Relationships

``` text
Users (1) -> (Many) Pets
Users (1) -> (Many) Appointments, as PetOwner
Users (1) -> (Many) Appointments, as Veterinarian
Users (1) -> (Many) Pet Listings, as ShelterOwner
Users (1) -> (Many) Adoption Requests, as PetOwner
Users (1) -> (Many) Adoption Requests, as ShelterOwner
Pets (1) -> (Many) Appointments
Pets (1) -> (Many) Health Records
Pet Listings (1) -> (Many) Adoption Requests
```

### 4.3 Data Security Rules

The source provides the following Firestore rules:

``` javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own data
    match /users/{userId} {
      allow read, write:
        if request.auth != null &&
           request.auth.uid == userId;
    }

    // Pet owners can manage their pets
    match /pets/{petId} {
      allow read, write:
        if request.auth != null &&
           resource.data.ownerId == request.auth.uid;
    }

    // Appointments accessible by pet owner and veterinarian
    match /appointments/{appointmentId} {
      allow read, write:
        if request.auth != null &&
           (
             resource.data.petOwnerId == request.auth.uid ||
             resource.data.veterinarianId == request.auth.uid
           );
    }
  }
}
```

------------------------------------------------------------------------

## 5. User Flows

### 5.1 Pet Owner Registration and Onboarding Flow

The source title contains the spelling "Registraion and Onboardng"; the
normalized title is used here.

``` text
Start
  -> Open App
  -> Select Role: Pet Owner
  -> Enter Registration Details
  -> Create Account
  -> Complete Profile Setup
  -> Add First Pet
  -> Dashboard Access
  -> End
```

Documented UI stages include:

-   PetCare welcome screen.
-   Sign-in screen.
-   Role selection.
-   Pet-owner registration form.
-   Profile settings.
-   Add-new-pet form.
-   Pet-owner dashboard.

### 5.2 Appointment Booking Flow

``` text
Pet Owner Dashboard
  -> Select "Book Appointment"
  -> Choose Pet
  -> Select Veterinarian
  -> Choose Date & Time
  -> Enter Appointment Details
  -> Confirm Booking
  -> Appointment Scheduled
  -> End
```

Documented appointment input fields/screens include:

-   Pet selection.
-   Veterinarian selection.
-   Appointment type.
-   Date selection.
-   Reason.
-   Optional notes.
-   Calendar view.
-   Appointment status/display.

### 5.3 Pet Adoption Flow

``` text
Browse Available Pets
  -> Filter by Preferences
  -> View Pet Details
  -> Submit Adoption Request
  -> Fill Application Form
  -> Background Check
  -> Shelter Review
  -> Meet & Greet Scheduled
  -> Adoption Approval
  -> Complete Adoption
  -> Success Story Sharing
  -> End
```

Documented adoption UI stages include:

-   Search/browse available pets.
-   Filter by pet type/preferences.
-   Pet card/details.
-   Adoption application.
-   Applicant information.
-   Adoption-request details.
-   Shelter-owner request management.
-   Approved request status.
-   Success stories.

### 5.4 Store Purchase Flow

A Store Purchase Flow is named in the document index, but the supplied
PDF does not include a dedicated textual flow for it.

------------------------------------------------------------------------

## 6. Data Flow Architecture

### 6.1 System-Level Data Flow

The data-flow architecture diagram identifies these external entities:

-   Pet Owners.
-   Veterinarians.
-   Shelter Owners.
-   Administrators.
-   External Services.

The PetCare application is the central process.

Data associated with each external entity:

-   **Pet Owners:** pet data, appointments, store orders.
-   **Veterinarians:** patient data, health records, appointments.
-   **Shelter Owners:** pet listings, adoption requests, success data.
-   **Administrators:** system data, analytics.
-   **External Services:** payment processing and email services.

Data operations/services shown beneath the PetCare application:

-   CRUD operations.
-   File uploads.
-   User authentication.
-   Push notifications.

Data stores/services shown in the diagram:

-   Firebase Firestore.
-   Firebase Storage.
-   Firebase Auth.
-   Firebase Messaging.

### 6.2 Level 0 Context Diagram

``` text
Pet Owners
  -- Pet Data / Appointments / Store Items / Health Data -->
PetCare App

Veterinarians
  -- Medical Records / Appointments / Patient Data -->
PetCare App

Shelter Owners
  -- Pet Listings / Adoption Requests / Success Data -->
PetCare App
```

The diagram represents PetCare as the central system exchanging domain
data with the three primary user groups.

### 6.3 Appointment Booking Data Flow

The source labels this flow as section 6.2 even though the document
index describes broader Data Flow subsections. The sequence is:

``` text
Pet Owner Request
  -> Pet Selection
  -> Veterinarian Availability Check
  -> Time Slot Selection
  -> Appointment Details Input
  -> Data Validation
  -> Firestore Write Operation
  -> Confirmation Notification
  -> Calendar Sync
  -> Reminder Scheduling
```

### 6.4 Authentication Data Flow

Authentication is named in the document index and system data-flow
architecture. The explicit standalone authentication-flow diagram is not
present in the supplied PDF. Documented authentication components are:

-   Firebase Auth.
-   User authentication operation.
-   `AuthService`.
-   Email/password registration.
-   Email/password sign-in.
-   Sign-out.
-   Password reset.
-   Authenticated-user state.
-   Role-based access control.
-   Multi-factor authentication requirement.

### 6.5 Appointment Data Flow

The appointment data flow is explicitly represented by the
appointment-booking sequence in section 6.3 above.

------------------------------------------------------------------------

## 7. Technical Implementation

### 7.1 State Management Architecture

PetCare uses Provider-based state management with multiple
`ChangeNotifierProvider` services.

``` dart
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => PetService()),
        ChangeNotifierProvider(create: (_) => AppointmentService()),
        ChangeNotifierProvider(create: (_) => StoreService()),
        ChangeNotifierProvider(create: (_) => AnalyticsService()),
        ChangeNotifierProvider(create: (_) => NotificationService()),
      ],
      child: PetCareApp(),
    ),
  );
}
```

Registered providers:

-   `AuthService`
-   `PetService`
-   `AppointmentService`
-   `StoreService`
-   `AnalyticsService`
-   `NotificationService`

### 7.2 Service Layer Pattern

The documented `PetService` extends `ChangeNotifier`, accesses Firestore
and Firebase Storage, maintains a local pet list and loading state, and
notifies UI listeners around asynchronous CRUD operations.

``` dart
class PetService extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  List _pets = [];
  bool _isLoading = false;

  List get pets => _pets;
  bool get isLoading => _isLoading;

  Future<List> getPetsByOwnerId(String ownerId) async {
    try {
      _isLoading = true;
      notifyListeners();

      QuerySnapshot snapshot = await _firestore
          .collection('pets')
          .where('ownerId', isEqualTo: ownerId)
          .where('isActive', isEqualTo: true)
          .orderBy('createdAt', descending: true)
          .get();

      _pets = snapshot.docs
          .map((doc) => PetModel.fromFirestore(doc))
          .toList();

      return _pets;
    } catch (e) {
      print('Error fetching pets: $e');
      return [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

Behavior represented by the example:

1.  Set loading state to `true`.
2.  Notify listeners.
3.  Query `pets` in Firestore.
4.  Filter by `ownerId`.
5.  Filter to `isActive == true`.
6.  Sort by `createdAt` descending.
7.  Convert Firestore documents using `PetModel.fromFirestore`.
8.  Store results in `_pets`.
9.  Return the list.
10. On error, print an error and return an empty list.
11. In `finally`, clear loading state and notify listeners.

### 7.3 Widget Architecture Pattern

The source calls this "Widget Architecture Pattern" although the index
calls section 7.3 "Model Layer Pattern."

``` dart
class PetDashboard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: 'My Pets'),
      body: Consumer(
        builder: (context, petService, child) {
          if (petService.isLoading) {
            return Center(
              child: CircularProgressIndicator(),
            );
          }

          if (petService.pets.isEmpty) {
            return EmptyStateWidget(
              title: 'No pets added yet',
              subtitle: 'Add your first pet to get started',
              actionButton: AddPetButton(),
            );
          }

          return RefreshIndicator(
            onRefresh: () => petService.refreshPets(),
            child: ListView.builder(
              itemCount: petService.pets.length,
              itemBuilder: (context, index) {
                return PetCard(
                  pet: petService.pets[index],
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(
          context,
          '/add-pet',
        ),
        child: Icon(Icons.add),
      ),
    );
  }
}
```

Widget behavior:

-   Uses a `Scaffold`.
-   Displays a custom app bar titled `My Pets`.
-   Consumes pet-service state.
-   Displays a loading spinner while data is loading.
-   Displays an empty-state widget when no pets exist.
-   Supports pull-to-refresh.
-   Renders pets using a `ListView.builder`.
-   Renders each pet with `PetCard`.
-   Provides a floating action button.
-   Navigates to `/add-pet` when the add button is pressed.

------------------------------------------------------------------------

## 8. API Documentation

### 8.1 Firebase Collections API

The source expresses Firestore collection operations using REST-like
endpoint notation.

### 8.1.1 Users Collection

  Endpoint            Method   Description           Access Level
  ------------------- -------- --------------------- ------------------
  `/users/{userId}`   GET      Get user profile      Own data + Admin
  `/users/{userId}`   POST     Create user profile   Own data
  `/users/{userId}`   PUT      Update user profile   Own data
  `/users/{userId}`   DELETE   Delete user account   Own data + Admin

### 8.1.2 Pets Collection

  Endpoint          Method   Description              Access Level
  ----------------- -------- ------------------------ ----------------------
  `/pets/{petId}`   GET      Get pet details          Owner + Assigned Vet
  `/pets`           POST     Add new pet              Pet Owner
  `/pets/{petId}`   PUT      Update pet information   Owner
  `/pets/{petId}`   DELETE   Remove pet               Owner

### 8.1.3 Appointments Collection

The document index names an Appointments Collection API subsection, but
the supplied PDF does not contain a standalone endpoint table for
appointments.

### 8.2 Service Methods

### 8.2.1 AuthService Methods

``` dart
class AuthService extends ChangeNotifier {
  /// Register new user with email and password.
  /// Returns: userId on success, error message on failure.
  Future registerWithEmailAndPassword({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required UserRole role,
  });

  /// Sign in existing user.
  /// Returns: userId on success, error message on failure.
  Future signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  /// Sign out current user.
  Future signOut();

  /// Update user profile information.
  /// Returns: success message or error.
  Future updateUserProfile(UserModel updatedUser);

  /// Reset password via email.
  Future resetPassword(String email);

  /// Check if user is authenticated.
  bool get isAuthenticated;

  /// Get current user.
  UserModel? get currentUser;
}
```

### 8.2.2 PetService Methods

``` dart
class PetService extends ChangeNotifier {
  /// Get all pets owned by specific user.
  /// Returns: List of PetModel objects.
  Future<List> getPetsByOwnerId(String ownerId);

  /// Get specific pet by ID.
  /// Returns: PetModel object or null.
  Future getPetById(String petId);

  /// Add new pet to database.
  /// Returns: Generated petId or null on error.
  Future addPet(PetModel pet);

  /// Update existing pet information.
  /// Returns: true on success, false on error.
  Future updatePet(PetModel pet);

  /// Remove pet from database (soft delete).
  /// Returns: true on success, false on error.
  Future deletePet(String petId);

  /// Search pets by name or breed.
  /// Returns: List of matching pets.
  Future<List> searchPets(String query);

  /// Filter pets by species.
  /// Returns: List of pets of specific species.
  Future<List> getPetsBySpecies(PetSpecies species);

  /// Upload pet photo.
  /// Returns: Download URL or null on error.
  Future uploadPetPhoto(String petId, File imageFile);
}
```

### 8.2.3 AppointmentService Methods

``` dart
class AppointmentService extends ChangeNotifier {
  /// Get appointments for pet owner.
  Future<List> getAppointmentsByPetOwner(String ownerId);

  /// Get appointments for veterinarian.
  Future<List> getAppointmentsByVeterinarian(String vetId);

  /// Book new appointment.
  /// Returns: appointmentId or null on error.
  Future bookAppointment(AppointmentModel appointment);

  /// Update appointment status.
  Future updateAppointmentStatus(
    String appointmentId,
    AppointmentStatus status,
  );

  /// Cancel appointment.
  Future cancelAppointment(String appointmentId);

  /// Get available time slots for veterinarian.
  Future<List> getAvailableSlots(
    String vetId,
    DateTime date,
  );

  /// Send appointment reminders.
  Future sendAppointmentReminder(String appointmentId);
}
```

### 8.3 Error Handling and Response Codes

#### Success Responses

-   `200` - Operation successful.
-   `201` - Resource created.
-   `204` - No content; successful deletion.

#### Client Errors

-   `400` - Bad request / invalid input.
-   `401` - Unauthorized access.
-   `403` - Forbidden operation.
-   `404` - Resource not found.

#### Server Errors

-   `500` - Internal server error.
-   `502` - Bad gateway.
-   `503` - Service unavailable.

### 8.4 Rate Limiting and Performance

-   **API rate limit:** 1,000 requests per minute per user.
-   **File upload limit:** 10 MB per file.
-   **Total file limit:** 50 MB total per user.
-   **Concurrent connections:** Maximum 10 per user.
-   **Data retention:** User data retained for 5 years after account
    deletion.

------------------------------------------------------------------------

## 9. Cross-System Domain Model

This section reorganizes only information explicitly present in the
source into an AI-friendly reference.

### User Roles

Canonical documented roles:

``` text
petOwner
veterinarian
shelterAdmin
shelterOwner
admin
```

### Pet Species

``` text
dog
cat
bird
rabbit
hamster
fish
reptile
other
```

### Pet Gender

``` text
male
female
unknown
```

### Pet Health Status

``` text
healthy
sick
recovering
critical
unknown
```

### Appointment Status

``` text
scheduled
confirmed
completed
cancelled
```

### Core Service Responsibilities

  -----------------------------------------------------------------------
  Service                             Responsibility evidenced by
                                      documentation
  ----------------------------------- -----------------------------------
  `AuthService`                       Registration, sign-in, sign-out,
                                      profile update, password reset,
                                      authentication state

  `PetService`                        Pet CRUD, querying, search/filter,
                                      photo upload, pet state

  `AppointmentService`                Owner/vet appointment queries,
                                      booking, status updates,
                                      cancellation, availability,
                                      reminders

  `StoreService`                      Registered in Provider
                                      architecture; store functionality
                                      is described at product level

  `AnalyticsService`                  Registered in Provider
                                      architecture; administrators are
                                      associated with analytics

  `NotificationService`               Registered in Provider
                                      architecture; reminders and push
                                      notifications are documented
  -----------------------------------------------------------------------

### Core Firebase Responsibilities

  Firebase Component   Documented Role
  -------------------- -------------------------------------------------
  Firestore            NoSQL database, CRUD, real-time synchronization
  Firebase Storage     File and image storage
  Firebase Auth        Authentication and authorization
  Firebase Messaging   Push notifications

------------------------------------------------------------------------

## 10. Important Source Inconsistencies and Gaps

These are documentation-level inconsistencies visible in the supplied
PDF. They are recorded rather than silently corrected.

1.  **Appointment veterinarian ID naming**
    -   Appointment schema uses `veterinariainId`.
    -   Firestore security rules use `veterinarianId`.
2.  **Section 7.3 naming**
    -   Document index calls it `Model Layer Pattern`.
    -   Actual page calls it `Widget Architecture Pattern`.
3.  **Data-flow numbering**
    -   Document index lists Level 0, Level 1, Authentication Data Flow,
        and Appointment Data Flow.
    -   The actual detailed appointment flow is labeled
        `6.2 Appointment Booking Data Flow`.
4.  **Missing explicit collection schemas**
    -   Pet Listings.
    -   Store Items.
    -   Adoption Requests.
5.  **Missing explicit API table**
    -   Appointments Collection API.
6.  **Index-only or under-documented sections**
    -   Shelter Owner Features.
    -   Administrator Features.
    -   Usability Requirements.
    -   Scalability Requirements.
    -   Development Tools.
    -   Store Purchase Flow.
    -   Standalone Authentication Data Flow.
7.  **UI walkthrough inconsistency**
    -   Some screenshot pages under the appointment/adoption/data-flow
        headings appear to show screens that do not semantically match
        the heading. This conversion preserves the textual workflow
        rather than treating mismatched screenshots as authoritative
        system behavior.

------------------------------------------------------------------------

## 11. AI Retrieval Index

Use these anchors when querying this document:

-   **Problem / motivation:** Section 1.
-   **User roles:** Sections 1.3 and 9.
-   **Pet-owner requirements:** Section 2.1.1.
-   **Veterinarian requirements:** Section 2.1.2.
-   **Shelter behavior:** Sections 2.1.3 and 5.3.
-   **Performance / security:** Section 2.2.
-   **Architecture:** Section 3.
-   **Firebase stack:** Sections 3.2 and 9.
-   **Database schemas:** Section 4.1.
-   **Relationships:** Section 4.2.
-   **Firestore rules:** Section 4.3.
-   **Registration flow:** Section 5.1.
-   **Appointment flow:** Sections 5.2 and 6.3.
-   **Adoption flow:** Section 5.3.
-   **System data flow:** Section 6.
-   **Provider state management:** Section 7.1.
-   **Service-layer implementation:** Section 7.2.
-   **Flutter widget pattern:** Section 7.3.
-   **API operations:** Section 8.1.
-   **Service method signatures:** Section 8.2.
-   **Response codes / limits:** Sections 8.3-8.4.
-   **Known documentation gaps/inconsistencies:** Section 10.

------------------------------------------------------------------------

## 12. Source Footer

-   Product: PetCare.
-   Technology: Flutter and Firebase.
-   Version: 1.0.0.
-   Source last updated: December 2023.
-   Source copyright notice: © 2023 PetCare Team. All rights reserved.
