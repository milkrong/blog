---
title: Build Modal With React
date: 2019-12-12 09:51:57
tags: 
  - React
categories:
  - Frontend
---

The modal is a component generating a popup in our react application. We usually implement it when users logout or make some decisions.

## Create App 
with `npx create-react-app` we can easily building a react web appliciation. Of course, we can use webpack from start, which I will post this content later.

## Build a modal component
The modal component we want is generical. So we need such props like `title, content, buttonText, ...comeActionHandler`.
For the layout, we have `header, content, footer`.

Here is my code 
```javascript
import React from 'react';
import './modal.css'

const Modal = (props) => {
  let modalClass = props.show? "modal open" : "modal"
  return (
    <div className={modalClass}>
      <div className="wrapper" style={{width : props.width}}>
        <div className="header">
          Title
          // font-awesome icon, please check the official website
          <i class="fas fa-times" onClick={props.handleClose}></i>
        </div>
        <div className="content">
          {props.content}
        </div>
        <div className="footer">
          <button style={{backgroundColor: 'grey'}} onClick={props.handleClose} >{props.cancelButtonText}</button>
          <button>{props.buttonText}</button>
        </div>
      </div>
    </div>
  )
}

export default Modal;
```

The code `let modalClass = props.show? "modal open" : "modal"` is used to control our modal by css class.

## Style the modal
Here is my css code
```css
.modal {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 0vh;
    background-color: transparent;
    overflow: hidden;
    transition: background-color 0.25s ease;
    z-index: 9999;
}

.modal.open {
  position: fixed;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  transition: background-color 0.25s;
}
.modal.open > .wrapper {
  transform: scale(1);
}

.modal .wrapper{
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: 2.5rem;
  background-color: white;
  border-radius: 0.3125rem;
  box-shadow: 0 0 2.5rem rgba(0, 0, 0, 0.5);
  transform: scale(0);
  transition: transform 0.25s;
  transition-delay: 0.15s;
}

.modal .header {
  position: relative;
  display: flex;
  border-bottom: 1px solid lightgrey;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  padding: 0 0 1.25rem;
}

.header i {
  float: right;
  cursor: pointer;
}

.modal .content {
  position: relative;
  display: flex;
  font-size: 0.875rem;
  line-height: 1.75;
}

.modal .footer {
  border-top: 1px solid lightgrey;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin: 0;
  padding: 1.875rem 0 0;
}

.footer button {
  padding: 0.7em 1.4em;
  margin: 0.3em 0.3em 0;
  font-weight: 400;
  border-radius: 0.15em;
  color: #ffffff;
  text-transform: uppercase;
  background-color: #3369ff;
}
```

I use lots of `flex-box` to layout my content.  The another key idea here is :

- Create a full screen layout called `modal`
- Without `open` class, the `modal` is hidden
- If class has `open` selector, I can use transform scale to popup the Modal window



Here is the final preview of my modal:

<img src="https://i.imgur.com/04Yvl3u.gif" alt="Imgur" style="zoom:67%;" />

[SourceCode](https://github.com/milkrong/JSCLASS/tree/master/homeworkModal)

