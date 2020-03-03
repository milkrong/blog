---
title: React Redux
date: 2019-12-20T03:44:51.253Z
tags: 
  - React
categories:
  - Frontend
---

> Redux is a predictable state container for Javascript apps

### Problem With Pure React Component

In React applications, the component states are passed by props from father component to its children. If we have some data fetching to the root node, it will be hard to get the data in a bottom-level child. Getting the data down there is like threading a needle through a mining expedition. Wait that doesn’t make any sense. Anyway, *it’s a pain*. Also known as “prop-drilling”. 

### Redux is our way to solve this problem

If you have components that are siblings and need to share data, the way to do that in React is to pull that data *up* into a parent component and pass it down with props.

Using the `connect` function that comes with `react-redux`, you can plug any component into Redux’s store and pull out the data it needs.

![Connecting Redux to the Avatar components](https://daveceddia.com/images/redux-connected-twitter.png)

### Guide to using a Redux in React

First please check this official webpage [React Redux](https://react-redux.js.org/) to install the package.

In react, we use 'react-redux' to connect to redux.
Usually, we build a directory to store the redux related files. We need to build following modules in a redux directory:
- store.js 
- actions.js
- reducer.js
  
user call the action in the component and pass the payload to reducer to update store. 
Outside of App compoennt in the `index.js`, we need to wrap the all components with `Provider` component. 