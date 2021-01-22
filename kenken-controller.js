angular
    .module("kenkenApp")
    .controller(
        "KenkenController",
        function (
            $scope,
            $interval,
            $window,
            $document,
            KenkenService,
            KenkenSolver
        ) {
            var timer;
            var undos;

            function loadValues() {
                var kenken = $window.localStorage.getItem("kenken");
                //console.log('loadValues %O', kenken);
                kenken = JSON.parse(kenken);
                if (!kenken) kenken = {};
                $scope.boardSize = kenken.boardSize || "4";
                $scope.ops = kenken.ops || "+-x/";
                if (kenken.board) {
                    $scope.board = kenken.board;
                    $scope.cages = kenken.cages;
                    $scope.cursor = kenken.cursor || [0, 0];
                    $scope.time = kenken.time || 0;
                    $scope.showPossibles = kenken.showPossibles == true;
                    $scope.solved = KenkenService.isSolved($scope.board);
                    undos = kenken.undos || [];
                    $scope.solver = KenkenSolver.getSolver($scope);
                    if (!$scope.solved) startTimer();
                } else {
                    $scope.newBoard();
                }
            }

            function storeValues() {
                var s = $scope;
                var kenken = {
                    boardSize: s.boardSize,
                    ops: s.ops,
                    board: s.board,
                    cages: s.cages,
                    cursor: s.cursor,
                    time: s.time,
                    showPossibles: s.showPossibles,
                };
                $window.localStorage.setItem("kenken", JSON.stringify(kenken));
                //console.log('storeValues %O', JSON.stringify(kenken));
            }

            function startTimer() {
                $interval.cancel(timer);
                timer = $interval(function () {
                    $scope.time += 1;
                    storeValues();
                }, 1000);
            }

            function guess(i, j, x) {
                var b = $scope.board;
                if (x !== b[i][j].guess) {
                    undos.push({
                        action: "guess",
                        i: i,
                        j: j,
                        guess: b[i][j].guess || "",
                    });
                }
                b[i][j].guess = x;
                storeValues();
                if (KenkenService.isSolved(b)) {
                    $interval.cancel(timer);
                    $scope.solved = true;
                }
            }
            $scope.guess = guess;

            function peek(i, j) {
                var cell = $scope.board[i][j];
                guess(i, j, cell.ans);
                cell.peeked = true;
            }

            function undo() {
                var u = undos.pop();
                console.log("undo! %O", u);
                if (u) {
                    if (u.action === "guess") {
                        $scope.board[u.i][u.j].guess = u.guess;
                        $scope.cursor = [u.i, u.j];
                    } else if (u.action === "reset") {
                        $scope.board = u.board;
                        $scope.time = u.time;
                        $scope.solved = KenkenService.isSolved($scope.board);
                        if (!$scope.solved) startTimer();
                    }
                }
            }

            function resetBoard() {
                undos.push({
                    action: "reset",
                    time: $scope.time,
                    board: angular.copy($scope.board),
                });
                $scope.board.forEach(function (row) {
                    row.forEach(function (cell) {
                        cell.guess = "";
                        delete cell.possible;
                    });
                });
                $scope.time = 0;
                $scope.solved = false;
                $scope.solver.reset();
                storeValues();
                console.log("reset! undos %O", undos);
            }

            $scope.newBoard = function () {
                console.log("reset board");
                var board = KenkenService.getBoard(
                    $scope.boardSize,
                    $scope.ops
                );
                $scope.board = board.cells;
                $scope.cages = board.cages;
                $scope.cursor = [0, 0];
                $scope.time = 0;
                $scope.showPossibles = false;
                $scope.solved = false;
                undos = [];
                $scope.solver = KenkenSolver.getSolver($scope);
                $scope.solver.reset();

                storeValues();
                startTimer();
            };

            $scope.cursorAt = function (i, j) {
                return (
                    !$scope.solved &&
                    !$scope.cursorHidden &&
                    $scope.cursor[0] === i &&
                    $scope.cursor[1] === j
                );
            };

            $scope.setCursor = function (i, j) {
                $scope.cursor = [i, j];
                $scope.cursorHidden = false;
                storeValues();
            };

            $scope.checksRight = function (cell) {
                return $scope.checking && cell.guess && cell.guess === cell.ans;
            };

            $scope.checksWrong = function (cell) {
                return $scope.checking && cell.guess && cell.guess !== cell.ans;
            };

            $scope.cellWalls = function (i, j) {
                return KenkenService.cellWalls($scope.board, i, j);
            };

            $scope.isCursorShadow = function (cell) {
                return (
                    $scope.cursorShadow &&
                    $scope.cursorShadow.indexOf(cell) > -1
                );
            };

            $scope.isLit = function (cell) {
                return $scope.lit && $scope.lit.indexOf(cell) > -1;
            };

            $scope.isSoftLit = function (cell) {
                return $scope.softLit && $scope.softLit.indexOf(cell) > -1;
            };

            $scope.keydown = function ($event) {
                // console.log('keydown: %d', $event.which);

                var b = $scope.board;
                var n = b.length;
                var c = $scope.cursor;
                var i = c[0],
                    j = c[1];
                var k = $event.which;

                // arrow keys
                if (k === 37) j = (j + n - 1) % n;
                else if (k === 39) j = (j + 1) % n;
                else if (k === 38) i = (i + n - 1) % n;
                else if (k === 40) i = (i + 1) % n;

                $scope.setCursor(i, j);

                // n: new board
                if (k === 78) $scope.newBoard();

                // p: show/hide possible values
                if (k === 80) $scope.showPossibles = !$scope.showPossibles;

                // r: reset board
                if (k === 82) resetBoard();

                // s: attempt to solve
                // if (k === 83) {
                //     $scope.showPossibles = true;
                //     if ($event.shiftKey) $scope.solver.step();
                //     else $scope.solver.solve();
                // }

                if ($scope.solved) return;

                // numbers: set guess, or alter possibilities
                if (k - 48 >= 1 && k - 48 <= n) {
                    var value = k - 48;
                    var possible = b[i][j].possible;
                    if ($event.shiftKey) {
                        if (!possible[value]) {
                            possible[value] = true;
                            possible[0]++;
                        }
                    } else if ($event.altKey) {
                        if (possible[value]) {
                            possible[value] = false;
                            possible[0]--;
                        }
                    } else {
                        guess(i, j, value);
                    }
                }

                // space: erase guess
                else if (k === 32) guess(i, j, "");
                // return: check guesses
                else if (k === 13) $scope.checking = true;
                // ?: peek
                else if (k === 191 && $event.shiftKey) peek(i, j);
                // esc: undo
                else if (k === 27) undo();
            };

            $scope.keyup = function ($event) {
                if ($scope.solved) return;
                var k = $event.which;
                if (k === 13) $scope.checking = false;
            };

            $document.ready(function () {
                $document[0].getElementById("board").focus();
            });

            // TODO: move to filter
            $scope.timerSeconds = function () {
                var t = $scope.time;
                var hours = Math.floor(t / 3600);
                var minutes = Math.floor((t - hours * 3600) / 60);
                var seconds = t - hours * 3600 - minutes * 60;

                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10 && hours > 0) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                var time = hours + ":" + minutes + ":" + seconds;
                return time;
            };

            loadValues();
        }
    );
