---
title: Build Tag Input With Redux
date: 2019-12-12 19:24:54
tags: 
  - React
categories:
  - Frontend
---

This is a practice( might be best?? :smiley:) using redux library in React App. I am going to build a tag input app.

## Dependencies

- redux
- react-redux
- node-scss

## Components

This is easiest part, we can focus more efforts on the style part.

```javascript
// src/tag.jsx
import React from 'react';
import { ReactComponent as Close } from './assets/cancel.svg';
// import svg file as component
import './tag.scss';

const Tag = ({name, handleClick, id}) => {
    return (
        <div className="tag">
            {name}
            <Close className="icon" onClick={() => handleClick(id)} />
        </div>
    )
}

export default Tag;
```

Style:

```scss
.tag {
    margin: 0 3px;
    font-size: 18px;
    font-weight: 400;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 16px;
    border: 1px solid #545454;
    padding: 3px 15px;

    &:hover {
        background-color: #545454;
        color: white;
    }
    .icon {
        margin-left: 8px;
        height: 100%;
        width: 15px;
        cursor: pointer;
    }
}
```



Now we have a tag component which has grey backgroud while hovering and a close icon inside the div.



Next we need a List component to combine all tags together:

```javascript
// src/tagList.jsx
import React from 'react';
import Tag from './tag';
import { connect } from 'react-redux';
import { deleteTag } from './redux/tag.actions';
import './tagList.scss';

class TagList extends React.Component{
    
    handleClick = id => {
        this.props.deleteTag(id);
    }

    render () {
        return (
            <div className="tag-list">
                {
                    this.props.tags.map(
                        tag => <Tag key={tag.id} name={tag.name} id={tag.id} handleClick={this.handleClick}/>
                    )
                }
            </div>
        )
    }
}

const mapStateToProps = state => {
    return { tags: state };
};

const mapDispatchToProps = dispatch => {
return {
    deleteTag: id => dispatch(deleteTag(id))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TagList);
```

Here I created component as Class Component, while we need state here. The state is from tag reducer and bind them to `props`. In addition to state with tags, I bind an action to the list. **Here is my fault that I should bind this delete action directly to tag component not this list** :worried:



## Reducer, Store, Action Creator

```javascript
// /src/redux/store.js
import {createStore} from 'redux';
import tagReducer from './tag.reducer';

const store = createStore(tagReducer);

export default store;
```

The store is the place to store all states, So we should pass it to the **redux provider**

```javascript
///src/index.js
...
import { Provider } from 'react-redux';
import store from './redux/store';
...

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>  
    ,document.getElementById('root'));

```

The reducer is a factory to process state with user defined action

```javascript
///src/redux/tag.reducer.js

const tagReducer = (state=[], action) => {
    switch (action.type) {
        case 'ADD_TAG':
            return [
                ...state,
                action.payload
            ];
        case 'DELETE_TAG':
            return state.filter(tag => tag.id !== action.tagToDeleteID);
        default:
            return state;
    }
}

export default tagReducer;
```

Initial state must be an empty list. and we will have two action types as our inputs. Since we have multiple actions, I put all of them in a file

```javascript
///src/redux/tag.actions.js

export const addTag = (name) => ({
    type: 'ADD_TAG',
    payload: {
        id: new Date().valueOf(),
        name: name
    }
});

export const deleteTag = id => ({
    type: 'DELETE_TAG',
    tagToDeleteID: id
})
```

 For every tag, I use timestamp as its **unique auto increment id**



## What is the thing I learnt from this implementation 

- The **Redux** is not easy, but we can get it with practice.
- Everything while building the logic is based on the function programming. 
- Make sure the input and state type of each part



## Final View

![Imgur](https://i.imgur.com/86Uz9DD.gif)