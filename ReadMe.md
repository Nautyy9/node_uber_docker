# Multi User Region Based Live Location Tracker.  
 ### Tech Used
   - KafkaJs -> for live location streaming data , providing location based on region by utilizing consumer groups . Future profing for upscaling based on user  
   - Redis -> for caching live data for updating last location updates even if user dissconnects
   - prismaDb -> for storing nearby location and getting updates for user location about a Minute ago
   - Docker -> because it works on my Machine :) . 
### Goal -> 
  - To create a application where multiple user can share and see all the other users live location .
### Usecase ->
  - Users can track the real-time location of friends or family members during travel or events. Useful for safety purposes when family members are traveling alone or at night.
  - Friends or groups can share their locations to coordinate meetups without needing constant messaging.
  -  At concerts, festivals, or fairs, users can see where their friends are and meet up easily.
  -  In case of emergencies, users can share their exact location with authorities or selected contacts.
  -  Alerts when users enter or exit predefined zones (e.g., children leaving school zones or safe areas).
## Selecting the server for Kafka Based On Region 
  ![IMG-20241024-WA0014](https://github.com/user-attachments/assets/e6f9655a-da7f-4530-aaee-02ab2fe24cf1)
  ![IMG-20241024-WA0011](https://github.com/user-attachments/assets/db20d9f0-cff4-4136-89bc-0113a5e9a8d1)

## Selecting different Map Design
![IMG-20241024-WA0010](https://github.com/user-attachments/assets/8132b883-8117-435a-9175-a0f0673120b3)

## The Search Feature
  ![IMG-20241024-WA0015](https://github.com/user-attachments/assets/8a1a42b8-4759-4da0-9041-68029a0891c9)

## The Zoom Feature
  ![IMG-20241024-WA0004](https://github.com/user-attachments/assets/68a53dd0-68e7-4e66-9b13-d58506aaf340)

## Distance Of Area From Current User Live Location
  Changes the Color with Change is distance travel
  - Green -> Within 50m radius
  - Yellow -> Within 100m radius
  - White ->  Place with distance of 100m or more
    
  - When No Nearby Location is Found   
    ![IMG-20241024-WA0012](https://github.com/user-attachments/assets/178fcf43-6421-493b-9e76-9f25180fe620)
  - When active Location is Found . Nearby Place gets Updated 
    ![IMG-20241024-WA0008](https://github.com/user-attachments/assets/20b009e8-565d-4154-a8f2-221b13e6a908)
    ![IMG-20241024-WA0013](https://github.com/user-attachments/assets/ef036873-9152-44c6-8162-309047a6921e)

## Multiple User Distance {Both Way Update with Haversine} 
  ![IMG-20241024-WA0003](https://github.com/user-attachments/assets/41d9db57-c868-4ee2-acea-9025c113e64d)
  
## Multiple User with Added Locations
  ![IMG-20241024-WA0007](https://github.com/user-attachments/assets/52957b94-602c-4404-ab9a-e7af5f3c9528)
