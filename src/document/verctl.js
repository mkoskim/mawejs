//*****************************************************************************
//*****************************************************************************
//
// Simple version control for filesystems without one.
//
//*****************************************************************************
//*****************************************************************************

/*
-------------------------------------------------------------------------------

Why version control? Because it makes certain things simpler. There is no need
for complex save / overwrite operations, as user can always get back to previous
versions. It safeguards against accidental deletions and such.

See: docs/FileTypes.txt

Sketching: Works only for MAWE files with UUID.

Story.mawe              UUID1.ZIP
UUID1       <--->       diff 1 (ZIP mod time => when created)
                        diff 2
                        diff 3
                        ...
                        mawe 8

Version control directory:

<chosen dir>/
    .mawe/
        vctl/
            UUID_1.zip
            UUID_2.zip
            ...
            UUID_X.zip
        deleted/
            UUID_A.ZIP
            UUID_B.ZIP

- Store ZIPs to different location than actual file, so that they are safe
  for accidental deleting.

-------------------------------------------------------------------------------
*/