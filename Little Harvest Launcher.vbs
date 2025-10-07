' Little Harvest - VBScript Desktop Launcher
' Double-click this file to start your Little Harvest application

Option Explicit

Dim objShell, objFSO, objFile, strPath, strCommand, intResult
Dim strNodeVersion, strNpmVersion, strError

' Create objects
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Change to the script directory
objShell.CurrentDirectory = strPath

' Check if we're in the right directory
If Not objFSO.FileExists(strPath & "\package.json") Then
    MsgBox "ERROR: This launcher must be in the Little Harvest project folder" & vbCrLf & _
           "Please move this file to your project root directory", vbCritical, "Little Harvest Launcher"
    WScript.Quit 1
End If

' Check if Node.js is installed
On Error Resume Next
strNodeVersion = objShell.Run("node --version", 0, True)
On Error GoTo 0

If strNodeVersion <> 0 Then
    MsgBox "ERROR: Node.js is not installed" & vbCrLf & _
           "Please install Node.js from https://nodejs.org/", vbCritical, "Little Harvest Launcher"
    WScript.Quit 1
End If

' Check if npm is available
On Error Resume Next
strNpmVersion = objShell.Run("npm --version", 0, True)
On Error GoTo 0

If strNpmVersion <> 0 Then
    MsgBox "ERROR: npm is not available", vbCritical, "Little Harvest Launcher"
    WScript.Quit 1
End If

' Show startup message
MsgBox "Starting Little Harvest Application..." & vbCrLf & vbCrLf & _
       "This may take a moment on first run." & vbCrLf & vbCrLf & _
       "The application will open in your default browser.", vbInformation, "Little Harvest Launcher"

' Set environment variables and run the setup command
strCommand = "cmd /c ""set DATABASE_URL=file:./prisma/dev.db && set NODE_ENV=development && set PORT=3000 && npm run setup && npm run dev"""

' Run the command
intResult = objShell.Run(strCommand, 1, False)

' Show completion message
MsgBox "Little Harvest has been stopped.", vbInformation, "Little Harvest Launcher"

' Clean up
Set objShell = Nothing
Set objFSO = Nothing
