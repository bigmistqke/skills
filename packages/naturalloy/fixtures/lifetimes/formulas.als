-- The six claims and the scenario of the lifetimes example canon, one formula to a block, blocks apart by a blank line.

some o, h: Owner, c: Failing | o.handler = h and eventually (dispose[o] and c.on = o and eventually (runNow[c] and eventually c.reached = h))

always all o: Owner, c: Cleanup |
  (dispose[o] and c in Registered and c.on = o and c not in Ran) implies eventually c in Ran

(always no c: Cleanup, o: Owner | runByCall[c, o])
and
(always no o: Owner | throwByCall[o])

(always all o: Owner, c, d: Cleanup |
  (dispose[o] and c + d in Registered - Ran and c.on = o and d.on = o and c->d in Clock.older)
  implies ((not runNow[c]) until runNow[d]))
and
(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Stopped)

always all o: Owner | (enter[o] and o in Disposed) implies some Throwing'

(always all o, k: Owner, c: Cleanup |
  (dispose[o] and k.parent = o and k not in Disposed and c in Registered - Ran and c.on = o)
  implies ((not runNow[c]) until dispose[k]))
and
(always all o, j, k: Owner |
  (dispose[o] and j.parent = o and k.parent = o and j->k in Birth.order and j not in Disposed and k not in Disposed)
  implies ((not dispose[j]) until dispose[k]))

(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Threw)
and
(always all o, h: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed and o.handler = h) implies eventually c.reached = h)
