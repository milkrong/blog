---
title: Flutter an application for game lovers (I)
tags:
  - Application
  - Flutter
  - VScode
url: 38.html
id: 38
categories:
  - Flutter
  - Software Development
date: 2019-05-28 12:12:36
---

This is a post to record my development experience to build an App with Flutter. Flutter is an open-source mobile application development framework created by Google. It is used to develop applications for Android and iOS, as well as being the primary method of creating applications for Google Fuchsia. I will show all the details to build this application on my Macbook.

Please check the source code here: [https://github.com/milkrong/flutter\_todays\_history](https://github.com/milkrong/flutter_todays_history)

Prerequisite
------------

To develop an application with Flutter, we need to install the Flutter SDK on our development devices. The easiest way to do that is following the official document here: [https://flutter.dev/docs/get-started/install/macos](https://flutter.dev/docs/get-started/install/macos).

After installation, we can use `flutter doctor` to check the other requirements. Next, we need a code editor like Visual Studio Code to write our codes. There is a plugin to support out Flutter development.

Create a project
----------------

Run the following command in your terminal: `flutter create game_discount`. Then we got a tree like this:

![](https://www.milkrong.com/wp-content/uploads/2019/05/WX20190528-115740@2x.png)

Project Tree

Now we got a project directory called 'history_app'. Under the path `'game_discount/lib'`, there is a file named `'main.dart'`.

Start Coding now
----------------

The main.dart file is the main entry that Flutter compiler can compile our project. The Flutter app is composed of components or widgets. We can name it `MyAPP()`.

    import 'package:flutter/material.dart';
    
    void main() => runApp(MyApp());
    
    class MyApp extends StatelessWidget {
      @override
      Widget build(BuildContext context) {
        return MaterialApp(
          title: 'Welcome to Flutter',
          home: Scaffold(
            appBar: AppBar(
              title: Text('Welcome to Flutter'),
            ),
            body: Center(
              child: Text('Hello World'),
            ),
          ),
        );
      }
    }

We import the material library to get material styled widgets to implement in our application. Then we using the main() function to set the entry. Myapp is a class that extends from StatelessWidget, which we won't change any state in that widget.

Under the class MyApp, we use a build function to create a Widget which will named MyApp. The build() function returns our application framework by combining different widget Class together. Now the application may like this:

![](https://flutter.dev/assets/get-started/ios/hello-world-ed7cf47213953bfca5eaa74fba63a78538d782f2c63a7c575068f3c2f7298bde.png)

Today, I'd like to stop here. See you next week.