### A0
For every cleanup_1:
  when cleanup_1 has run, code has registered cleanup_1.

### A1
For every cleanup:
  when the cleanup is on an owner, the cleanup has run.

### A2
For every owner_1:
  when pulse has disposed owner_1, the dispose of owner_1 has not been stopped.

### A3
For every cleanup and every owner:
  when the cleanup waits at the owner, pulse has disposed the owner.

### A4
There is a cleanup_1 such that cleanup_1 has run and code has not registered cleanup_1.

### A5
For every cleanup:
  now and at every later moment:
    when the cleanup has run, then at the next moment, code has registered the cleanup.

### A6
For every cleanup_1 and every owner_1:
  when cleanup_1 is on owner_1, then now or at a later moment, pulse has disposed owner_1.

### A7
For every owner:
  when a cleanup is on the owner, pulse has disposed the owner.

### A8
For every cleanup_1:
  both or neither of these hold:
    - for every owner_1:
        when owner_1 is the home of cleanup_1, pulse has disposed owner_1
    - cleanup_1 has run

### A9
For every cleanup and every owner:
  when the cleanup is on the owner and has run, the dispose of the owner has not been stopped.

### B0
For every cleanup_1 and every owner_1:
  all of these hold:
    - now or at a later moment, the following holds:
        pulse has disposed owner_1
    - at every moment from now until the first such moment, not including it, the following holds:
        code has registered cleanup_1.

### B1
For every cleanup_1:
  code has registered cleanup_1 now or at a later moment, and cleanup_1 has not run at every moment from now until the first such moment, not including it.

### B2
For every cleanup_1 and every owner_1:
  all of these hold:
    - now or at an earlier moment, the following holds:
        pulse has disposed owner_1
    - at every moment after the last such moment, up to and including now, the following holds:
        cleanup_1 has run.

### B3
For every cleanup_1 and every owner_1:
  when code has registered cleanup_1
  then the following holds:
    pulse has disposed owner_1 now or at a later moment, and cleanup_1 has not run at every moment from now until the first such moment, not including it.