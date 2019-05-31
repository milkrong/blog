---
title: 102. Binary Tree Level Order Traversal
tags:
  - BFS
categories:
  - Algorigthms
date: 2019-05-31 16:58:52
---


This is a great and easy understand question solving with BFS method.

**Discription**: Given a binary tree, return the level order traversal of its nodes' values. (ie, from left to right, level by level).

**Test Example**:

```
    3
   / \
  9  20
    /  \
   15   7
```

**Test ouput**:

```
[
  [3],
  [9,20],
  [15,7]
]
```

**Solution**:

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

from collections import deque
class Solution:
    def levelOrder(self, root: TreeNode) -> List[List[int]]:
        if not root: return []
        queue, res = deque([root]), []
        
        while queue:
            cur_level, size = [], len(queue)
            for i in range(size):
                node = queue.popleft()
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
                cur_level.append(node.val)
            res.append(cur_level)
        return res
```

From the basic idea of BFS, we put each node on each into the queue, then, find its left and right child. Since we need to collect nodes level by level, we need a for loop to get all nodes on each level and check their children. 