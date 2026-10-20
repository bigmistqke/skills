### A0
For every cleanup:
  when the cleanup has run, code has registered the cleanup.

### A1
For every cleanup_1:
  when cleanup_1 is on an owner, cleanup_1 has run.

### A2
For every owner:
  when pulse has disposed the owner, the dispose of the owner has not been stopped.

### A3
For every cleanup_1 and every owner_1:
  when cleanup_1 waits at owner_1, pulse has disposed owner_1.

### A4
There is a cleanup such that the cleanup has run and code has not registered the cleanup.

### A5
For every cleanup_1:
  now and at every later moment:
    when cleanup_1 has run, then at the next moment, code has registered cleanup_1.

### A6
For every cleanup and every owner:
  when the cleanup is on the owner, then now or at a later moment, pulse has disposed the owner.

### A7
For every owner_1:
  when a cleanup is on owner_1, pulse has disposed owner_1.

### A8
For every cleanup:
  both or neither of these hold:
    - for every owner:
        when the owner is the home of the cleanup, pulse has disposed the owner
    - the cleanup has run

### A9
For every cleanup_1 and every owner_1:
  when cleanup_1 is on owner_1 and has run, the dispose of owner_1 has not been stopped.

### B0
For every cleanup_1 and every owner_1:
  pulse has disposed owner_1 now or at a later moment, and code has registered cleanup_1 at every moment from now until the first such moment, not including it.

### B1
For every cleanup_1:
  all of these hold:
    - now or at a later moment, the following holds:
        code has registered cleanup_1
    - at every moment from now until the first such moment, not including it, the following holds:
        cleanup_1 has not run.

### B2
For every cleanup_1 and every owner_1:
  pulse has disposed owner_1 now or at an earlier moment, and cleanup_1 has run at every moment after the last such moment, up to and including now.

### B3
For every cleanup_1 and every owner_1:
  when code has registered cleanup_1
  then all of these hold:
         - now or at a later moment, the following holds:
             pulse has disposed owner_1
         - at every moment from now until the first such moment, not including it, the following holds:
             cleanup_1 has not run.