(function () {
    Parse.initialize("GrBj4SFReUGNWW0ESelq546pygPfHcBMmhoE3fVm","jlprLeuSCdXfuVMnrpVHbkIvQb82ZOwUQogvSANl");
    var users = {};
    ["loginView", "evaluationView", "updateSuccessView"].forEach(function (cuser) {
        templateCode = document.getElementById(cuser).text;
        users[cuser] = doT.template(templateCode)
    });
    var cuser = {
        loginRequiredView: function (users) {
            return function () {
                var cuser = Parse.User.current();
                if (cuser) {
                    users()
                } else {
                    window.location.hash = "login/" + window.location.hash
                }
            }
        }
    };
    var navi = {
        navbar: function () {
            var users = Parse.User.current();
            if (users) {
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
        evaluationView: cuser.loginRequiredView(function () {
            var cuser = Parse.Object.extend("Evaluation");
            var navi = Parse.User.current();
            var PAcl = new Parse.ACL;
            PAcl.setPublicReadAccess(false);
            PAcl.setPublicWriteAccess(false);
            PAcl.setReadAccess(navi, true);
            PAcl.setWriteAccess(navi, true);
            var PQuery = new Parse.Query(cuser);
            PQuery.equalTo("user", navi);
            PQuery.first({
                success: function (PQuery) {
                    window.EVAL = PQuery;
                    if (PQuery === undefined) {
                        var member = TAHelp.getMemberlistOf(navi.get("username")).filter(function (users) {
                            return users.StudentId !== navi.get("username") ? true : false
                        }).map(function (users) {
                            users.scores = ["0", "0", "0", "0"];
                            return users
                        })
                    } else {
                        var member = PQuery.toJSON().evaluations
                    }
                    document.getElementById("content").innerHTML = users.evaluationView(member);
                    document.getElementById("evaluationForm-submit").value = PQuery === undefined ? "送出表單" : "修改表單";
                    document.getElementById("evaluationForm").addEventListener("submit", function () {
                        for (var i = 0; i < member.length; i++) {
                            for (var j = 0; j < member[i].scores.length; j++) {
                                var k = document.getElementById("stu" + member[i].StudentId + "-q" + j);
                                var l = k.options[k.selectedIndex].value;
                                member[i].scores[j] = l
                            }
                        }
                        if (PQuery === undefined) {
                            PQuery = new cuser;
                            PQuery.set("user", navi);
                            PQuery.setACL(PAcl)
                        }
                        console.log(member);
                        PQuery.set("evaluations", member);
                        PQuery.save(null, {
                            success: function () {
                                document.getElementById("content").innerHTML = users.updateSuccessView()
                            },
                            error: function () {}
                        })
                    }, false)
                },
                error: function (users, cuser) {}
            })
        }),
        loginView: function (cuser) {
            var PAcl = function (users) {
                    var cuser = document.getElementById(users).value;
                    return TAHelp.getMemberlistOf(cuser) === false ? false : true
                };
            var PQuery = function (users, cuser, navi) {
                    if (!cuser()) {
                        document.getElementById(users).innerHTML = navi;
                        document.getElementById(users).style.display = "block"
                    } else {
                        document.getElementById(users).style.display = "none"
                    }
                };
            var member = function () {
                    navi.navbar();
                    window.location.hash = cuser ? cuser : ""
                };
            var auth = function () {
                    var users = document.getElementById("form-signup-password");
                    var cuser = document.getElementById("form-signup-password1");
                    var navi = users.value ===cusert.value ? true : false;
                    PQuery("form-signup-message", function () {
                        return navi
                    }, "Passwords don't match.");
                    return navi
                };
            document.getElementById("content").innerHTML = users.loginView();
            document.getElementById("form-signin-student-id").addEventListener("keyup", function () {
                PQuery("form-signin-message", function () {
                    return PAcl("form-signin-student-id")
                }, "The student is not one of the class students.")
            });
            document.getElementById("form-signin").addEventListener("submit", function () {
                if (!PAcl("form-signin-student-id")) {
                    alert("The student is not one of the class students.");
                    return false
                }
                Parse.User.logIn(document.getElementById("form-signin-student-id").value, document.getElementById("form-signin-password").value, {
                    success: function (users) {
                        member()
                    },
                    error: function (users, cuser) {
                        PQuery("form-signin-message", function () {
                            return false
                        }, "Invaild username or password.")
                    }
                })
            }, false);
            document.getElementById("form-signup-student-id").addEventListener("keyup", function () {
                PQuery("form-signup-message", function () {
                    return PAcl("form-signup-student-id")
                }, "The student is not one of the class students.")
            });
            document.getElementById("form-signup-password1").addEventListener("keyup", auth);
            document.getElementById("form-signup").addEventListener("submit", function () {
                if (!PAcl("form-signup-student-id")) {
                    alert("The student is not one of the class students.");
                    return false
                }
                var users = auth();
                if (!users) {
                    return false
                }
                var cuser = new Parse.User;
                cuser.set("username", document.getElementById("form-signup-student-id").value);
                cuser.set("password", document.getElementById("form-signup-password").value);
                cuser.set("email", document.getElementById("form-signup-email").value);
                cuser.signUp(null, {
                    success: function (users) {
                        member()
                    },
                    error: function (users, cuser) {
                        PQuery("form-signup-message", function () {
                            return false
                        }, cuser.message)
                    }
                })
            }, false)
        }
    };
    var PAcl = Parse.Router.extend({
        routes: {
            "": "indexView",
            "peer-evaluation/": "evaluationView",
            "login/*redirect": "loginView"
        },
        indexView: navi.evaluationView,
        evaluationView: navi.evaluationView,
        loginView: navi.loginView
    });
    this.Router = new PAcl;
    Parse.history.start();
    navi.navbar()
})()