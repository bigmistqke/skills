sig Owner { parent: lone Owner, handler: lone Owner }
sig Cleanup { var on: lone Owner, var reached: lone Owner }
sig Handler in Owner {}
sig Failing in Cleanup {}
var sig Registered, Ran in Cleanup {}
var sig Disposed in Owner {}
var sig Entering in Owner {}
var sig Throwing {}
var sig Threw in Owner {}
var sig Redisposed in Owner {}
var sig Stopped in Owner {}
one sig Clock { var older: Cleanup -> Cleanup }
one sig Birth { order: Owner -> Owner }

fact tree { no o: Owner | o in o.^parent }
fact nearest_handler { all o: Owner | o.handler = { h: Handler | h in o.^parent and no g: Handler | g in o.^parent and h in g.^parent } }
fact creation_order { no o: Owner | o->o in Birth.order  all a, b, c: Owner | (a->b in Birth.order and b->c in Birth.order) implies a->c in Birth.order }
fact siblings_have_an_order { all a, b: Owner | (a != b and some a.parent and a.parent = b.parent) implies (a->b in Birth.order or b->a in Birth.order) }
fact init { no Registered and no Ran and no Disposed and no Entering and no Throwing and no Threw and no Redisposed and no Stopped and no on and no reached and no Clock.older }

pred quiet { no Entering' and no Throwing' }
pred kept { reached' = reached and Threw' = Threw and Redisposed' = Redisposed and Stopped' = Stopped }
pred register[c: Cleanup, o: Owner] {
  c not in Registered  Registered' = Registered + c  on' = on + c->o
  Clock.older' = Clock.older + (Registered -> c)
  Ran' = Ran  Disposed' = Disposed  kept  quiet }
pred dispose[o: Owner] {
  o not in Disposed  no (o.parent & Stopped)  Disposed' = Disposed + o
  Registered' = Registered  Ran' = Ran  on' = on  Clock.older' = Clock.older  kept  quiet }
pred runIt[c: Cleanup] {
  c in Registered - Ran  no (c.on & Stopped)  Ran' = Ran + c
  Registered' = Registered  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  kept  quiet }
pred enter[o: Owner] {
  Entering' = o
  Registered' = Registered  Ran' = Ran  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  kept }
-- code disposes an owner that pulse disposed, and that call runs a cleanup of the owner
pred runByCall[c: Cleanup, o: Owner] {
  o in Disposed  c in Registered - Ran  c.on = o  Ran' = Ran + c  Redisposed' = Redisposed + o
  Registered' = Registered  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  reached' = reached  Threw' = Threw  Stopped' = Stopped  quiet }
-- code disposes an owner that pulse disposed, and that call runs nothing
pred disposeAgain[o: Owner] {
  o in Disposed  Redisposed' = Redisposed + o  Ran' = Ran
  Registered' = Registered  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  reached' = reached  Threw' = Threw  Stopped' = Stopped  quiet }
-- code disposes an owner that pulse disposed, and that call throws
pred throwByCall[o: Owner] {
  o in Disposed  Redisposed' = Redisposed + o  Threw' = Threw + o  Ran' = Ran
  Registered' = Registered  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  reached' = reached  Stopped' = Stopped  quiet }
-- the error of a cleanup that failed reaches a handler or boundary
pred report[c: Cleanup, h: Owner] {
  c in Failing  c in Ran  no c.reached  h in Handler  reached' = reached + c->h  Threw' = Threw  Redisposed' = Redisposed  Stopped' = Stopped
  Registered' = Registered  Ran' = Ran  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  quiet }
-- the error of a cleanup that failed leaves through the dispose of its owner, which throws
pred escape[c: Cleanup] {
  c in Failing  c in Ran  no c.reached  c.on in Disposed  c.on not in Threw  Threw' = Threw + c.on  reached' = reached  Redisposed' = Redisposed  Stopped' = Stopped
  Registered' = Registered  Ran' = Ran  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  quiet }
-- the error of a cleanup that failed stops the dispose of its owner: the other cleanups do not run and the children are not disposed
pred stop[c: Cleanup] {
  c in Failing  c in Ran  c.on in Disposed  c.on not in Stopped  Stopped' = Stopped + c.on  reached' = reached  Threw' = Threw  Redisposed' = Redisposed
  Registered' = Registered  Ran' = Ran  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  quiet }
pred idle { Registered' = Registered Ran' = Ran Disposed' = Disposed on' = on Clock.older' = Clock.older kept quiet }
fact each_step { always (idle or (some c: Cleanup, o: Owner | register[c,o] or dispose[o] or runIt[c] or runByCall[c,o] or disposeAgain[o] or throwByCall[o] or enter[o] or (some h: Owner | report[c,h]) or escape[c] or stop[c])) }
fact registers_once { always all c: Cleanup | register[c, Owner] implies after always not register[c, Owner] }
fact entering_throws_only { always (some Throwing' implies some Entering') }

pred runNow[c: Cleanup] { c not in Ran and c in Ran' }

pred spec_disposing_an_owner_runs_its_cleanups {
always all o: Owner, c: Cleanup |
  (dispose[o] and c in Registered and c.on = o and c not in Ran) implies eventually c in Ran
}

pred spec_dispose_runs_once {
(always no c: Cleanup, o: Owner | runByCall[c, o])
and
(always no o: Owner | throwByCall[o])
}

pred spec_owner_cleanups_run_newest_first_and_in_isolation {
(always all o: Owner, c, d: Cleanup |
  (dispose[o] and c + d in Registered - Ran and c.on = o and d.on = o and c->d in Clock.older)
  implies ((not runNow[c]) until runNow[d]))
and
(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Stopped)
}

pred spec_a_disposed_owner_cannot_be_entered {
always all o: Owner | (enter[o] and o in Disposed) implies some Throwing'
}

pred spec_an_owner_disposes_its_sub_owners_before_its_own_cleanups {
(always all o, k: Owner, c: Cleanup |
  (dispose[o] and k.parent = o and k not in Disposed and c in Registered - Ran and c.on = o)
  implies ((not runNow[c]) until dispose[k]))
and
(always all o, j, k: Owner |
  (dispose[o] and j.parent = o and k.parent = o and j->k in Birth.order and j not in Disposed and k not in Disposed)
  implies ((not dispose[j]) until dispose[k]))
}

pred spec_a_throwing_owner_cleanup_is_reported {
(always all o: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed) implies always o not in Threw)
and
(always all o, h: Owner, c: Failing |
  (runNow[c] and c.on = o and o in Disposed and o.handler = h) implies eventually c.reached = h)
}

pred scenario_1_term_teardown_model {
some o, h: Owner, c: Failing | o.handler = h and eventually (dispose[o] and c.on = o and eventually (runNow[c] and eventually c.reached = h))
}
