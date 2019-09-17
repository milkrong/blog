---
title: Flutter Learning Notes 1
date: 2019-09-16 20:28:36
tags: 
	- Application
	- Flutter
categories:
  - Flutter
  - Software Development
---

# Flutter Applications Notes

### Install Flutter on windows

1. Download Flutter SDK from here:https://flutter.dev/docs/get-started/install/windows
2. Extract the zipped file and set the a system PATH to **flutter\bin**
3. Using any code editor you like, I recommend **Visual Studio Code** or **Intellij IDE**
4. Install Flutter plugin in the editor you choose



### Prepare to run application with flutter

1. Enable [VM acceleration](https://developer.android.com/studio/run/emulator-acceleration)on your machine.
2. Launch **Android Studio > Tools > Android > AVD Manager**and select **Create Virtual Device**. (The **Android**submenu is only present when inside an Android project.)
3. Choose a device definition and select **Next**.
4. Select one or more system images for the Android versions you want to emulate, and select **Next**. An *x86*or *x86_64*image is recommended.
5. Under Emulated Performance, select **Hardware - GLES 2.0**to enable [hardware acceleration](https://developer.android.com/studio/run/emulator-acceleration).
6. Verify the AVD configuration is correct, and select **Finish**.
7. For details on the above steps, see [Managing AVDs](https://developer.android.com/studio/run/managing-avds).
8. In Android Virtual Device Manager, click **Run**in the toolbar. The emulator starts up and displays the default canvas for your selected OS version and device.

### Check flutter in your system

Open the terminal and run 

```shell
$PATH to flutter/bin/flutter doctor
```

We should get something like this

```shell
[-] Android toolchain - develop for Android devices
    • Android SDK at D:\Android\sdk
    ✗ Android SDK is missing command line tools; download from https://goo.gl/XxQghQ
    • Try re-installing or updating your Android SDK,
      visit https://flutter.dev/setup/#android-setup for detailed instructions.
```