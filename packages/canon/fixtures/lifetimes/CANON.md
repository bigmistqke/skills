# Canon: lifetimes, with a logic layer

Six specs of pulse's lifetimes canon, each with the Alloy predicate that states it. The vocabulary below is the model they share.

## @term teardown-model

> A teardown is the trace of what pulse does when it disposes an owner.

```alloy vocabulary
sig Owner { parent: lone Owner }
sig Cleanup { var on: lone Owner }
sig Failing in Cleanup {}
var sig Registered, Ran in Cleanup {}
var sig Disposed in Owner {}
var sig Entering in Owner {}
var sig Throwing {}
one sig Clock { var older: Cleanup -> Cleanup }

fact tree { no o: Owner | o in o.^parent }
fact init { no Registered and no Ran and no Disposed and no Entering and no Throwing and no on and no Clock.older }

pred quiet { no Entering' and no Throwing' }
pred register[c: Cleanup, o: Owner] {
  c not in Registered  Registered' = Registered + c  on' = on + c->o
  Clock.older' = Clock.older + (Registered -> c)
  Ran' = Ran  Disposed' = Disposed  quiet }
pred dispose[o: Owner] {
  o not in Disposed  Disposed' = Disposed + o
  Registered' = Registered  Ran' = Ran  on' = on  Clock.older' = Clock.older  quiet }
pred runIt[c: Cleanup] {
  c in Registered - Ran  Ran' = Ran + c
  Registered' = Registered  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  quiet }
pred enter[o: Owner] {
  Entering' = o
  Registered' = Registered  Ran' = Ran  Disposed' = Disposed  on' = on  Clock.older' = Clock.older }
-- code disposes an owner that pulse disposed, and that call runs a cleanup of the owner
pred runByCall[c: Cleanup, o: Owner] {
  o in Disposed  c in Registered - Ran  c.on = o  Ran' = Ran + c
  Registered' = Registered  Disposed' = Disposed  on' = on  Clock.older' = Clock.older  quiet }
pred idle { Registered' = Registered Ran' = Ran Disposed' = Disposed on' = on Clock.older' = Clock.older quiet }
fact each_step { always (idle or (some c: Cleanup, o: Owner | register[c,o] or dispose[o] or runIt[c] or runByCall[c,o] or enter[o])) }
fact registers_once { always all c: Cleanup | register[c, Owner] implies after always not register[c, Owner] }
fact entering_throws_only { always (some Throwing' implies some Entering') }

pred runNow[c: Cleanup] { c not in Ran and c in Ran' }
pred disposing[o: Owner] { o in Disposed and some c: Cleanup | c.on = o and c in Registered and c not in Ran }
```

```alloy bounds
for 3 but 1..8 steps
```

A teardown the specs must allow: a call enters an owner while pulse disposes it, after a cleanup of the owner has failed.

```alloy scenario
some o: Owner | eventually (enter[o] and disposing[o] and some c: Failing | c.on = o and eventually c in Ran)
```

### @spec disposing-an-owner-runs-its-cleanups

> When pulse disposes an owner, each cleanup that code has registered on the owner and that did not run runs.

```alloy
always all o: Owner, c: Cleanup |
  (dispose[o] and c in Registered and c.on = o and c not in Ran) implies eventually c in Ran
```

```map reviewed=3d2900e5d6b6
"pulse disposes an owner" -> dispose[o]
"each cleanup that code has registered on the owner" -> c in Registered and c.on = o
"did not run" -> c not in Ran
"runs" -> eventually c in Ran
```

### @spec dispose-runs-once

> When code disposes an owner that pulse disposed, no cleanup that code has registered on the owner runs.

```alloy
always no c: Cleanup, o: Owner | runByCall[c, o]
```

```map reviewed=3a2925ed8cdf
"code disposes an owner that pulse disposed" -> runByCall[c, o]
"no cleanup that code has registered on the owner runs" -> always no c: Cleanup, o: Owner
```

### @spec owner-cleanups-run-newest-first

> When pulse disposes an owner, the cleanups that code has registered on the owner run newest first.

```alloy
always all o: Owner, c, d: Cleanup |
  (dispose[o] and c + d in Registered - Ran and c.on = o and d.on = o and c->d in Clock.older)
  implies ((not runNow[c]) until runNow[d])
```

```map reviewed=bd9f0923e4f4
"pulse disposes an owner" -> dispose[o]
"the cleanups that code has registered on the owner" -> c + d in Registered - Ran and c.on = o and d.on = o
"newest first" -> c->d in Clock.older
"run" -> runNow[d]
```

### @spec a-disposed-owner-cannot-be-entered

> When a call enters an owner that pulse disposed, the call throws.

```alloy
always all o: Owner | (enter[o] and o in Disposed) implies some Throwing'
```

```map reviewed=fb8dbcd0bb6d
"a call enters an owner that pulse disposed" -> enter[o] and o in Disposed
"the call throws" -> some Throwing'
```

### @spec an-owner-disposes-its-children-before-its-own-cleanups

> When pulse disposes an owner, pulse disposes each child that the owner owns and that pulse did not dispose before any cleanup that code has registered on the owner runs.

```alloy
always all o, k: Owner, c: Cleanup |
  (dispose[o] and k.parent = o and k not in Disposed and c in Registered - Ran and c.on = o)
  implies ((not runNow[c]) until dispose[k])
```

```map reviewed=03a2977aa4cf
"pulse disposes an owner" -> dispose[o]
"each child that the owner owns and that pulse did not dispose" -> k.parent = o and k not in Disposed
"before any cleanup that code has registered on the owner runs" -> (not runNow[c]) until dispose[k]
```

### @spec a-throwing-owner-cleanup-is-reported

> When a cleanup that code has registered on an owner fails while pulse disposes the owner, no call throws.

```alloy
always all o: Owner |
  (enter[o] and disposing[o] and (some c: Failing | c.on = o and (c in Ran or eventually c in Ran)))
  implies no Throwing'
```

```map reviewed=68ddb1d0e1fa
"a cleanup that code has registered on an owner fails" -> some c: Failing | c.on = o and (c in Ran or eventually c in Ran)
"while pulse disposes the owner" -> enter[o] and disposing[o]
"no call throws" -> no Throwing'
```
