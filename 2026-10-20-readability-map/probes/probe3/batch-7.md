# Batch 7

## Sentence U1

Now is moment 0. Every moment after moment 4 is like moment 4, forever.

> Pulse has disposed the owner now or at a later moment, and up to the first such moment, but not necessarily at it, code has registered the cleanup.

**U1-never**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | no |
| 3 | yes | no |
| 4 | yes | no |

**U1-now**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | no | yes |
| 1 | no | no |
| 2 | no | no |
| 3 | no | no |
| 4 | no | no |

**U1-atEnd**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | no | yes |
| 3 | yes | no |
| 4 | yes | no |

**U1-after**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | yes |
| 3 | no | no |
| 4 | no | no |

**U1-first**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | no | yes |
| 2 | no | no |
| 3 | yes | yes |
| 4 | yes | no |

**U1-broken**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | no | no |
| 2 | yes | yes |
| 3 | yes | no |
| 4 | yes | no |

## Sentence U2

Now is moment 0. Every moment after moment 4 is like moment 4, forever.

> All of these hold:
>   - now or at a later moment, the following holds:
>       code has registered the cleanup
>   - at every moment from now until the first such moment, not including it, the following holds:
>       the cleanup has not run.

**U2-never**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | no |
| 3 | yes | no |
| 4 | yes | no |

**U2-now**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | no | yes |
| 1 | no | no |
| 2 | no | no |
| 3 | no | no |
| 4 | no | no |

**U2-atEnd**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | no | yes |
| 3 | yes | no |
| 4 | yes | no |

**U2-after**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | yes |
| 3 | no | no |
| 4 | no | no |

**U2-first**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | no | yes |
| 2 | no | no |
| 3 | yes | yes |
| 4 | yes | no |

**U2-broken**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | no | no |
| 2 | yes | yes |
| 3 | yes | no |
| 4 | yes | no |

## Sentence U3

Now is moment 0. Every moment after moment 4 is like moment 4, forever.

> The cleanup is on the owner until the dispose of the owner has been stopped.

**U3-never**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | no |
| 3 | yes | no |
| 4 | yes | no |

**U3-now**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | no | yes |
| 1 | no | no |
| 2 | no | no |
| 3 | no | no |
| 4 | no | no |

**U3-atEnd**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | no | yes |
| 3 | yes | no |
| 4 | yes | no |

**U3-after**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | yes |
| 3 | no | no |
| 4 | no | no |

**U3-first**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | no | yes |
| 2 | no | no |
| 3 | yes | yes |
| 4 | yes | no |

**U3-broken**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | no | no |
| 2 | yes | yes |
| 3 | yes | no |
| 4 | yes | no |

## Sentence S1

Now is moment 4. Moment 0 is the first moment there is.

> Pulse has disposed the owner now or at an earlier moment, and ever since the last such moment, code has registered the cleanup.

**S1-never**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | no |
| 3 | yes | no |
| 4 | yes | no |

**S1-now**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | no | no |
| 3 | no | no |
| 4 | no | yes |

**S1-atEnd**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | no | yes |
| 3 | yes | no |
| 4 | yes | no |

**S1-before**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | yes | yes |
| 3 | yes | no |
| 4 | yes | no |

**S1-last**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | yes | yes |
| 2 | no | no |
| 3 | yes | yes |
| 4 | yes | no |

**S1-broken**

| moment | code has registered the cleanup | pulse has disposed the owner |
|---|---|---|
| 0 | yes | no |
| 1 | yes | yes |
| 2 | yes | no |
| 3 | no | no |
| 4 | yes | no |

## Sentence S2

Now is moment 4. Moment 0 is the first moment there is.

> Code has registered the cleanup now or at an earlier moment, and at every moment after the last such moment, up to and including now, the cleanup has not run.

**S2-never**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | no |
| 3 | yes | no |
| 4 | yes | no |

**S2-now**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | no | no |
| 3 | no | no |
| 4 | no | yes |

**S2-atEnd**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | no | yes |
| 3 | yes | no |
| 4 | yes | no |

**S2-before**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | yes | yes |
| 3 | yes | no |
| 4 | yes | no |

**S2-last**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | yes | yes |
| 2 | no | no |
| 3 | yes | yes |
| 4 | yes | no |

**S2-broken**

| moment | the cleanup has not run | code has registered the cleanup |
|---|---|---|
| 0 | yes | no |
| 1 | yes | yes |
| 2 | yes | no |
| 3 | no | no |
| 4 | yes | no |

## Sentence S3

Now is moment 4. Moment 0 is the first moment there is.

> All of these hold:
>   - now or at an earlier moment, the following holds:
>       the dispose of the owner has been stopped
>   - at every moment after the last such moment, up to and including now, the following holds:
>       the cleanup is on the owner.

**S3-never**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | yes | no |
| 2 | yes | no |
| 3 | yes | no |
| 4 | yes | no |

**S3-now**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | no | no |
| 3 | no | no |
| 4 | no | yes |

**S3-atEnd**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | no | yes |
| 3 | yes | no |
| 4 | yes | no |

**S3-before**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | no | no |
| 1 | no | no |
| 2 | yes | yes |
| 3 | yes | no |
| 4 | yes | no |

**S3-last**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | yes | yes |
| 2 | no | no |
| 3 | yes | yes |
| 4 | yes | no |

**S3-broken**

| moment | the cleanup is on the owner | the dispose of the owner has been stopped |
|---|---|---|
| 0 | yes | no |
| 1 | yes | yes |
| 2 | yes | no |
| 3 | no | no |
| 4 | yes | no |

