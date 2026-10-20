### A0
For every cleanup_1:
  cleanup_1 has run at the next moment exactly when cleanup_1 has run now.

### A1
For every cleanup_1 and every owner_1 and every cleanup_2 and every owner_2:
  both or neither of these hold:
    - at the next moment, cleanup_2 is on owner_2
    - at least one of these holds:
        - all of these hold:
            - cleanup_2 and cleanup_1 are the same
            - owner_2 and owner_1 are the same
        - all of these hold:
            - cleanup_2 is on owner_2
            - there is no owner_3 such that all of these hold:
                - cleanup_2 and cleanup_1 are the same
                - owner_3 and owner_1 are the same

### A2
For every owner_1:
  when no cleanup is on owner_1, pulse has not disposed owner_1.

### A3
For every cleanup:
  when the cleanup has run, the cleanup is on an owner that pulse has disposed.

### A4
For every owner_1:
  both or neither of these hold:
    - pulse has disposed owner_1
    - for every cleanup_1:
        when cleanup_1 is on owner_1, cleanup_1 has run.

### A5
For every cleanup:
  now and at every later moment:
    when code has registered the cleanup, then now or at a later moment, the cleanup has run.

### A6
For every cleanup_1 and every owner_1:
  when cleanup_1 is on owner_1 and the dispose of owner_1 has been stopped, cleanup_1 has not run.

### A7
For every cleanup:
  when the following holds:
    in integers that wrap around at the analyzer's bit width, number_1 is greater than 1, where number_1 is the number of values of the owner such that the cleanup is on the owner
  then code has registered the cleanup.

### A8
For every owner_1:
  when pulse has disposed owner_1
  then for every owner_2:
         when owner_2 is the parent of owner_1, pulse has disposed owner_2.

### A9
For every cleanup and every owner:
  when the cleanup waits at the owner, the cleanup is on the owner.

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