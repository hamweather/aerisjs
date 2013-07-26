define([
  'aeris',
  'testUtils',
  'gmaps/route/commands/commandmanager',
  'aeris/promise',
  'mocks/routecommand',
  'testErrors/untestedspecerror'
], function(aeris, testUtils, CommandManager, Promise, MockRouteCommand, UntestedSpecError) {
  describe('A CommandManager', function() {
    var manager;

    beforeEach(function() {
      manager = new CommandManager();
    });

    afterEach(function() {
      manager = null;
      testUtils.resetFlag();
    });


    it('should reject non-commands', function() {
      expect(function() {
        manager.executeCommand('not a command');
      }).toThrowType('InvalidArgumentError');
    });

    it('should execute a command, and return a promise', function() {
      var command = new MockRouteCommand();
      var promise;

      spyOn(command, 'execute').andCallThrough();

      promise = manager.executeCommand(command);
      expect(command.execute).toHaveBeenCalled();
      expect(promise).toBeInstanceOf(Promise);

      promise.done(testUtils.setFlag);
      waitsFor(testUtils.checkFlag, 'promise to resolve', 200);
    });

    it('should undo the last executed command, and return a promise', function() {
      var command1 = new MockRouteCommand();
      var command2 = new MockRouteCommand();
      var promise;

      spyOn(command1, 'undo').andCallThrough();
      spyOn(command2, 'undo').andCallThrough();

      manager.executeCommand(command1).done(testUtils.setFlag);

      waitsFor(testUtils.checkFlag, 'command1 to resolve', 200);
      runs(function() {
        testUtils.resetFlag();

        promise = manager.undo().done(testUtils.setFlag);

        expect(promise).toBeInstanceOf(Promise);
        expect(command1.undo).toHaveBeenCalled();

        // Test: didn't undo the wrong command
        expect(command2.undo).not.toHaveBeenCalled();
      });

      waitsFor(testUtils.checkFlag, 'undo promise to resolve', 50000);
    });

    it('should fail to undo a command if a command has not been executed', function() {
      expect(function() {
        manager.undo();
      }).toThrowType('CommandHistoryError');
    });

    it('should redo a command, and return a promise', function() {
      var command = new MockRouteCommand();
      var promise;

      spyOn(command, 'execute').andCallThrough();

      manager.executeCommand(command).done(function() {
        manager.undo().done(function() {
          promise = manager.redo(testUtils.setFlag);

          expect(promise).toBeInstanceOf(Promise);
          expect(command.execute.callCount).toEqual(2);
        });
      });
    });


    describe('Command queue sequence', function() {
      var command, command1, command2, command3;

      beforeEach(function() {
        command = new MockRouteCommand();
        command1 = new MockRouteCommand();
        command2 = new MockRouteCommand();
        command3 = new MockRouteCommand();
      });

      afterEach(function() {
        command1 = command2 = command3 = null;
      });



      it('should wait for one command to resolve before executing the next', function() {
        var promise1 = manager.executeCommand(command1);

        spyOn(command2, 'execute').andCallFake(function() {
          expect(promise1.getState()).toEqual('resolved');

          testUtils.setFlag();
          return new Promise();
        });

        manager.executeCommand(command2);

        waitsFor(testUtils.checkFlag, 'command2.execute to be called', 250);
      });

      it('should wait for a command to resolve before undoing it', function() {
        var promise = manager.executeCommand(command);

        spyOn(command, 'undo').andCallFake(function() {
          expect(promise.getState()).toEqual('resolved');

          testUtils.setFlag();
          return new Promise();
        });

        manager.undo();

        waitsFor(testUtils.checkFlag, 'command2.undo to be called', 250);
      });

      it('should wait for an undo to finish before redoing', function() {
        var undoPromise;

        manager.executeCommand(command);
        undoPromise = manager.undo();

        // Spy on redo
        spyOn(command, 'execute').andCallFake(function() {
          expect(undoPromise.getState()).toEqual('resolved');

          testUtils.setFlag();
          return new Promise();
        });

        manager.redo();

        waitsFor(testUtils.checkFlag, 'command to redo', 450);
      });

      it('should wait for an undo to finish before undoing again', function() {
        var undoPromise2;

        p1 = manager.executeCommand(command1);
        p2 = manager.executeCommand(command2);
        undoPromise2 = manager.undo();          // undo command2

        spyOn(command1, 'undo').andCallFake(function() {
          expect(undoPromise2.getState()).toEqual('resolved');

          testUtils.setFlag();
          return new Promise();
        });

        manager.undo();                         // undo command1

        waitsFor(testUtils.checkFlag, 'command2.undo to be called', 500);
      });


      it('should only redo after undoing', function() {
        manager.executeCommand(command1);
        manager.executeCommand(command2);
        manager.executeCommand(command3);

        manager.undo(); // undoes cmd3
        manager.undo(); // undoes cmd2

        manager.executeCommand(command3);

        expect(function() {
          manager.redo();
        }).toThrowType('CommandHistoryError');
      });
    });


    describe('canUndo', function() {
      it('should return true if undo is available', function() {
        var command1 = new MockRouteCommand();
        var command2 = new MockRouteCommand();

        manager.executeCommand(command1);             // stack = 1
        expect(manager.canUndo()).toEqual(true);

        manager.undo();                               // stack = 0
        manager.redo();                               // stack = 1
        expect(manager.canUndo()).toEqual(true);

        manager.undo();                               // stack = 0
        manager.executeCommand(command1);             // stack = 1
        manager.executeCommand(command2);             // stack = 2
        manager.undo();                               // stack = 1
        expect(manager.canUndo()).toEqual(true);

        manager.undo();                               // stack = 0
        manager.executeCommand(command2);             // stack = 1
        expect(manager.canUndo()).toEqual(true);
      });

      it('should return false if undo is not available', function() {
        var command1 = new MockRouteCommand();
        var command2 = new MockRouteCommand();

        expect(manager.canUndo()).toEqual(false);

        manager.executeCommand(command1);           // stack = 1
        manager.undo();                             // stack = 0
        expect(manager.canUndo()).toEqual(false);

        manager.redo();                             // stack = 1
        manager.executeCommand(command2);           // stack = 2
        manager.undo();                             // stack = 1
        manager.undo();                             // stack = 0
        expect(manager.canUndo()).toEqual(false);
      });
    });

    describe('canRedo', function() {
      it('should return true if redo is available', function() {
        var command1 = new MockRouteCommand();
        var command2 = new MockRouteCommand();

        manager.executeCommand(command1);           // stack = 1
        manager.undo();                             // stack = 0
        expect(manager.canRedo()).toEqual(true);

        manager.redo();                             // stack = 1
        manager.executeCommand(command2);           // stack = 2
        manager.undo();                             // stack = 1
        expect(manager.canRedo()).toEqual(true);

        manager.redo();                             // stack = 2
        manager.undo();                             // stack = 1
        manager.undo();                             // stack = 0
        expect(manager.canRedo()).toEqual(true);

        manager.redo();                             // stack = 1
        expect(manager.canRedo()).toEqual(true);
      });

      it('should return false if redo is not available', function() {
        var command1 = new MockRouteCommand();
        var command2 = new MockRouteCommand();

        expect(manager.canRedo()).toEqual(false);

        manager.executeCommand(command1);           // stack = 1
        expect(manager.canRedo()).toEqual(false);

        manager.undo();                             // stack = 0
        manager.redo();                             // stack = 1
        expect(manager.canRedo()).toEqual(false);

        manager.executeCommand(command2);           // stack = 2
        expect(manager.canRedo()).toEqual(false);

        manager.undo();                             // stack = 1
        manager.redo();                             // stack = 2
        expect(manager.canRedo()).toEqual(false);

        manager.undo();                             // stack = 1
        manager.undo();                             // stack = 0
        manager.executeCommand(command1);           // stack = 1
        expect(manager.canRedo()).toEqual(false);
      });
    });
  });
});
