//*****************************************************************************
//*****************************************************************************
//
// Project management for stories
//
//*****************************************************************************
//*****************************************************************************

/*
-------------------------------------------------------------------------------

What do we want?

- We want software to scan through chosen directory trees and find story
  projects for us.

- We want to organize projects to different kinds of worksets

- We want to see projects with different states: sketches, under working,
  ready, published.

- Collections would be absolutely great! That is, you could make workset and
  make a collection from that.

- We might store the project database to local storage: we could update that
  from disk, and sync it on disk, so that you could access the same info
  from different browser, too. But first, we could build that for local
  storage.

-------------------------------------------------------------------------------
*/

var dblocation;     // Where to store project information
var directories;    // Directories to scan for projects

var projects;       // Projects
