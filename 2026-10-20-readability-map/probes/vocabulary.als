
sig Owner { parent: lone Owner }
sig Cleanup { var on: set Owner, at: lone Owner, home: one Owner, name: one String, tags: set String, n: set Int, size: one Int }
var sig Registered, Ran in Cleanup {}
var sig Disposed, Stopped in Owner {}
pred gone[o: Owner] { o in Disposed }
pred gone2[o: Owner] { o in Disposed and o not in Stopped }
fun owners[c: Cleanup]: Owner { c.on }
fun owners2[c: Cleanup]: Owner { c.on + c.at }
let twice[x] = x in Disposed
