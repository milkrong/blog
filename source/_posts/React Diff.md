---
title: React Diff
tags:
  - React
---

## Introduction
React is a JavaScript frontend framework created by Facebook. It helps developers to write more organized code to build user interfaces, by letting the use of a descriptive language (JSX) and supporting the concept of components and composition.
React is also fast, and the reason behind its performance is the use of virtual DOMs. When the user interacts with the UI, React tries to figure out the most efficient way to update the UI. In this article, we’ll get an idea about how things work inside.
## Virtual DOM :
Based on the application code, React builds a tree of element that describes how the written component should be rendered. The nodes of this tree are stored as plain objects called elements.
After a user interaction that results in a state or props changes, React will generate a new tree of element.
## Reconciliation:
Before updating the user interface, React uses a reconciliation algorithm to compare the new tree with the most recent tree to find out the most efficient way to update the user interface. The user interface is not necessary a browser interface but can be android/IOS application (React native or React IOS).
The problem at this level is that the latest algorithms for solving this kind of problems have a complexity of O(n³).

React uses heuristics to reduce the time of processing and to solve the problem in a linear time O(n).
From the official documentation, there are two assumptions :
1- Different elements will produce different trees.
React parses the tree using Breadth-first search (BFS). For a node of tree, if the element type is changed, for example from ‘section’ to ‘div’. React will destroy all the sub-tree under that element and will reconstruct it from scratch.

2- The developer can hint at which child elements may be stable across different renders with a key prop.
This means by adding keys to children, React will be able to track changes.