(function () {
    Parse.initialize("GrBj4SFReUGNWW0ESelq546pygPfHcBMmhoE3fVm","jlprLeuSCdXfuVMnrpVHbkIvQb82ZOwUQogvSANl");
    var Puser = {};
    ["loginView", "evaluationView", "updateSuccessView"].forEach(function (Cuser) {
        templateCode = document.getElementById(Cuser).text;
        Puser[Cuser] = doT.template(templateCode)
    });
    var Cuser = {
        loginRequiredView: function (Puser) {
            return function () {
                var Cuser = Parse.User.current();
                if (Cuser) {
                    Puser()
                } else {
                    window.location.hash = "login/" + window.location.hash
                }
            }
        }
    };
    var navi = {
        navbar: function () {
            var Puser = Parse.User.current();
            if (Puser) {
                document.getElementById("loginButton").style.display = "none";
                document.getElementById("logoutButton").style.display = "block";
                document.getElementById("evaluationButton").style.display = "block"
            } else {
                document.getElementById("loginButton").style.display = "block";
                document.getElementById("logoutButton").style.display = "none";
                document.getElementById("evaluationButton").style.display = "none"
            }
            document.getElementById("logoutButton").addEventListener("click", function () {
                Parse.User.logOut();
                navi.navbar();
                window.location.hash = "login/"
            })
        },
        evaluationView: Cuser.loginRequiredView(function () {
            var Cuser = Parse.Object.extend("Evaluation");
            var navi = Parse.User.current();
            var rout = new Parse.ACL;
            rout.setPublicReadAccess(false);
            rout.setPublicWriteAccess(false);
            rout.setReadAccess(navi, true);
            rout.setWriteAccess(navi, true);
            var PQuery = new Parse.Query(Cuser);
            PQuery.equalTo("user", navi);
            PQuery.first({
                success: function (PQuery) {
                    window.EVAL = PQuery;
                    if (PQuery === undefined) {
                        var member = TAHelp.getMemberlistOf(navi.get("username")).filter(function (Puser) {
                            return Puser.StudentId !== navi.get("username") ? true : false
                        }).map(function (Puser) {
                            Puser.scores = ["0", "0", "0", "0"];
                            return Puser
                        })
                    } else {
                        var member = PQuery.toJSON().evaluations
                    }
                    document.getElementById("content").innerHTML = Puser.evaluationView(member);
                    document.getElementById("evaluationForm-submit").value = PQuery === undefined ? "送出表單" : "修改表單";
                    document.getElementById("evaluationForm").addEventListener("submit", function () {
                        for (var auth = 0; auth < member.length; auth++) {
                            for (var j = 0; j < member[auth].scores.length; j++) {
                                var StuID = document.getElementById("stu" + member[auth].StudentId + "-q" + j);
                                var val = StuID.options[StuID.selectedIndex].value;
                                member[auth].scores[j] = val
                            }
                        }
                        if (PQuery === undefined) {
                            PQuery = new Cuser;
                            PQuery.set("user", navi);
                            PQuery.setACL(rout)
                        }
                        console.log(member);
                        PQuery.set("evaluations", member);
                        PQuery.save(null, {
                            success: function () {
                                document.getElementById("content").innerHTML = e.updateSuccessView()
                            },
                            error: function () {}
                        })
                    }, false)
                },
                error: function (Puser, Cuser) {}
            })
        }),
        loginView: function (Cuser) {
            var rout = function (Puser) {
                    var Cuser = document.getElementById(Puser).value;
                    return TAHelp.getMemberlistOf(Cuser) === false ? false : true
                };
            var PQuery = function (Puser, Cuser, navi) {
                    if (!Cuser()) {
                        document.getElementById(Puser).innerHTML = navi;
                        document.getElementById(Puser).style.display = "block"
                    } else {
                        document.getElementById(Puser).style.display = "none"
                    }
                };
            var member = function () {
                    navi.navbar();
                    window.location.hash = Cuser ? Cuser : ""
                };
            var auth = function () {
                    var Puser = document.getElementById("form-signup-password");
                    var Cuser = document.getElementById("form-signup-password1");
                    var navi = Puser.value === Cuser.value ? true : false;
                    PQuery("form-signup-message", function () {
                        return navi
                    }, "Passwords don't match.");
                    return navi
                };
            document.getElementById("content").innerHTML = Puser.loginView();
            document.getElementById("form-signin-student-id").addEventListener("keyup", function () {
                PQuery("form-signin-message", function () {
                    return rout("form-signin-student-id")
                }, "The student is not one of the class students.")
            });
            document.getElementById("form-signin").addEventListener("submit", function () {
                if (!rout("form-signin-student-id")) {
                    alert("The student is not one of the class students.");
                    return false
                }
                Parse.User.logIn(document.getElementById("form-signin-student-id").value, document.getElementById("form-signin-password").value, {
                    success: function (Puser) {
                        member()
                    },
                    error: function (Puser, Cuser) {
                        PQuery("form-signin-message", function () {
                            return false
                        }, "Invaild username or password.")
                    }
                })
            }, false);
            document.getElementById("form-signup-student-id").addEventListener("keyup", function () {
                PQuery("form-signup-message", function () {
                    return rout("form-signup-student-id")
                }, "The student is not one of the class students.")
            });
            document.getElementById("form-signup-password1").addEventListener("keyup", auth);
            document.getElementById("form-signup").addEventListener("submit", function () {
                if (!rout("form-signup-student-id")) {
                    alert("The student is not one of the class students.");
                    return false
                }
                var Puser = auth();
                if (!Puser) {
                    return false
                }
                var Cuser = new Parse.User;
                Cuser.set("username", document.getElementById("form-signup-student-id").value);
                Cuser.set("password", document.getElementById("form-signup-password").value);
                Cuser.set("email", document.getElementById("form-signup-email").value);
                Cuser.signUp(null, {
                    success: function (Puser) {
                        member()
                    },
                    error: function (Puser, Cuser) {
                        PQuery("form-signup-message", function () {
                            return false
                        }, Cuser.message)
                    }
                })
            }, false)
        }
    };
    var rout = Parse.Router.extend({
        routes: {
            "": "indexView",
            "peer-evaluation/": "evaluationView",
            "login/*redirect": "loginView"
        },
        indexView: navi.evaluationView,
        evaluationView: navi.evaluationView,
        loginView: navi.loginView
    });
    this.Router = new rout;
    Parse.history.start();
   navi.navbar()
})()