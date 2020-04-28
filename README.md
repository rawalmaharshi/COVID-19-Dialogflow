# Natural User Interaction
## COVID-19 Assignment (Based on Dialogflow and Unity )

### Name: Maharshi Rawal
### Level: Graduate
### Program Description
The program is a speech-interface that provides updated information about the COVID-19 virus.
The project is built on the Google Dialogflow platform which is used for natural language and intent recognition.
The front-end portion of the project is based on the Unity game engine with character taken from Mixamo. 
It returns COVID-19 data specific to Countries, States, and Counties (excluding Cities). It can also return data within a specific time period. It can respond to commands like *What are the latest stats for Alachua County*, *How many new cases last week in the US?*, etc.

### Tools Used To Develop
1. Google Dialogflow
2. Unity Game Engine (LTS version 2018.4.21f1)
3. Operating System: Backend - Linux, Frontend (Unity) - Windows
4. Code Editor: Microsoft Visual Studio Code

### Dependencies
1. Backend - Dialogflow
    - Bent
2. Frontend - Unity
    - Mixamo (for Character)

### How to Compile
**Backend**
1. Extract the zip archive with name *COVID-19-backend.zip*.
2. Open the Google Dialogflow platform and go to settings to import the project (into a new agent). Select the Import from Zip option and import the file named *NUI-Asgn3-COVID19.zip*
3. Make sure the code in the fulfillment of the dialogflow agent is same as the one as in the *index.js* file in the folder extracted in the *step 1*. Also, make sure to copy the contents of *package.json* into the fulfillment.


**Frontend**
1. Make a new 3D project in unity.
2. Copy the contents from the Assets folder into the Assets folder of the new project. 
3. Go to settings and Build the project. Also, make sure to copy your Dialogflow API certificates into the Build Data directory.

**Note:** Above steps are required only if you wish to build the project entirely. If you just wish to run the project, follow the steps:

**How to Build:** 

Enter the folder named *NUI-COVID19-Unity* which is extracted from the zip file *NUI-COVID19-Unity.zip*.

Go to the folder *WindowsBuild*, run the program - **NUI-COVID19.exe**.

### How to Run

After running the application, every time you need to request some data, press the record button next to the character and say the command. After that, press the button again to initiate the request.



