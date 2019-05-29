---
title: 'Algorithms: Bread First Search'
tags:
  - BFS
id: 13
categories:
  - Algorigthms
date: 2019-05-27 00:44:56
---

**Breadth-first search** (**BFS**) is an [algorithm](https://en.wikipedia.org/wiki/Algorithm) for traversing or searching [tree](https://en.wikipedia.org/wiki/Tree_data_structure) or [graph](https://en.wikipedia.org/wiki/Graph_(data_structure)) data structures. It starts at the [tree root](https://en.wikipedia.org/wiki/Tree_(data_structure)#Terminology) (or some arbitrary node of a graph, sometimes referred to as a 'search key), and explores all of the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.

```
    1 procedure BFS(G,start_v):
    2      let S be a queue
    3      S.enqueue(start_v)
    4      while S is not empty
    5          v = S.dequeue()
    6          if v is the goal:
    7              return v
    8          for all edges from v to w in G.adjacentEdges(v) do
    9              if w is not labeled as discovered:
    10                 label w as discovered
    11                 w.parent = v
    12                 S.enqueue(w)
```

When using a bread first search, we need to add each node to the queue data structure. With each node pop from the queue, we visit its neighbours to find out target.

For a cyclic graph, to prevent visit a node twice, we use a data structure like map or set to save the visited nodes.