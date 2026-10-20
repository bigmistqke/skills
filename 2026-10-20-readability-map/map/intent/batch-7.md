Vocabulary file: canon-plugin-alloy-fixtures-lifetimes.vocab.md

## s226  (spec-disposing-an-owner-runs-its-cleanups)

Claim (the unit's name, as a sentence): **disposing an owner runs its cleanups**

Formula:
```alloy
always all o: Owner, c: Cleanup |
  (dispose[o] and c in Registered and c.on = o and c not in Ran) implies eventually c in Ran
```

What the formula says, exactly:
```text
Now and at every later moment, for every owner and every cleanup:

when all of these hold:
- pulse disposes the owner
- code has registered the cleanup
- the cleanup is on the owner
- the cleanup has not run

then now or at a later moment, the cleanup has run.
```

## s227  (spec-dispose-runs-once)

Claim (the unit's name, as a sentence): **dispose runs once**

Formula:
```alloy
(always no c: Cleanup, o: Owner | runByCall[c, o])
and
(always no o: Owner | throwByCall[o])
```

What the formula says, exactly:
```text
All of these hold:
- now and at every later moment, there is no combination of cleanup_1 and owner_1 such that code disposes owner_1 after pulse disposed it, and that call runs cleanup_1, a cleanup that code has registered on owner_1 and that has not run
- now and at every later moment, there is no owner_2 such that code disposes owner_2 after pulse disposed it, and that call throws
```

## s228  (spec-owner-cleanups-run-newest-first-and-in-isolation)

Claim (the unit's name, as a sentence): **owner cleanups run newest first and in isolation**

Formula:
```alloy
(always all o: Owner, c, d: Cleanup |
  (dispose[o] and c + d in Registered - Ran and c.on = o and d.on = o and c->d in Clock.older)
  implies ((not runNow[c]) until runNow[d]))
and
(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Stopped)
```

What the formula says, exactly:
```text
All of these hold:
- now and at every later moment, for every owner_1 and every cleanup_1 and every cleanup_2:

  when all of these hold:
  - pulse disposes owner_1
  - code has registered cleanup_1
  - cleanup_1 has not run
  - code has registered cleanup_2
  - cleanup_2 has not run
  - cleanup_1 is on owner_1
  - cleanup_2 is on owner_1
  - code registered cleanup_1 before cleanup_2

  then all of these hold:
  - now or at a later moment, the following holds:

    cleanup_2 runs
  - at every moment from now until the first such moment, not including it, the following holds:

    cleanup_1 does not run
- now and at every later moment, for every owner_2 and every failing cleanup:

  when the failing cleanup runs, is on owner_2 and pulse has disposed owner_2, then now and at every later moment, the dispose of owner_2 has not been stopped.
```

## s229  (spec-a-disposed-owner-cannot-be-entered)

Claim (the unit's name, as a sentence): **a disposed owner cannot be entered**

Formula:
```alloy
always all o: Owner | (enter[o] and o in Disposed) implies some Throwing'
```

What the formula says, exactly:
```text
Now and at every later moment, for every owner:

when a call enters the owner and pulse has disposed the owner, then right after, a call is throwing.
```

## s230  (spec-an-owner-disposes-its-sub-owners-before-its-own-cleanups)

Claim (the unit's name, as a sentence): **an owner disposes its sub owners before its own cleanups**

Formula:
```alloy
(always all o, k: Owner, c: Cleanup |
  (dispose[o] and k.parent = o and k not in Disposed and c in Registered - Ran and c.on = o)
  implies ((not runNow[c]) until dispose[k]))
and
(always all o, j, k: Owner |
  (dispose[o] and j.parent = o and k.parent = o and j->k in Birth.order and j not in Disposed and k not in Disposed)
  implies ((not dispose[j]) until dispose[k]))
```

What the formula says, exactly:
```text
All of these hold:
- now and at every later moment, for every owner_1 and every owner_2 and every cleanup:

  when all of these hold:
  - pulse disposes owner_1
  - owner_1 is the parent of owner_2
  - pulse has not disposed owner_2
  - code has registered the cleanup
  - the cleanup has not run
  - the cleanup is on owner_1

  then all of these hold:
  - now or at a later moment, the following holds:

    pulse disposes owner_2
  - at every moment from now until the first such moment, not including it, the following holds:

    the cleanup does not run
- now and at every later moment, for every owner_3 and every owner_4 and every owner_5:

  when all of these hold:
  - pulse disposes owner_3
  - owner_3 is the parent of owner_4
  - owner_3 is the parent of owner_5
  - owner_4 was created before owner_5
  - pulse has not disposed owner_4
  - pulse has not disposed owner_5

  then all of these hold:
  - now or at a later moment, the following holds:

    pulse disposes owner_5
  - at every moment from now until the first such moment, not including it, the following holds:

    pulse does not dispose owner_4.
```

## s231  (spec-a-throwing-owner-cleanup-is-reported)

Claim (the unit's name, as a sentence): **a throwing owner cleanup is reported**

Formula:
```alloy
(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Threw)
and
(always all o, h: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed and o.handler = h) implies eventually c.reached = h)
```

What the formula says, exactly:
```text
All of these hold:
- now and at every later moment, for every owner_1 and every failing_cleanup_1:

  when failing_cleanup_1 runs, is on owner_1 and pulse has disposed owner_1, then now and at every later moment, the dispose of owner_1 has not thrown
- now and at every later moment, for every owner_2 and every owner_3 and every failing_cleanup_2:

  when all of these hold:
  - failing_cleanup_2 runs
  - failing_cleanup_2 is on owner_2
  - pulse has disposed owner_2
  - owner_3 is the nearest error handler or boundary above owner_2

  then now or at a later moment, the error of failing_cleanup_2 has reached owner_3.
```
