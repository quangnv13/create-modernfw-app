#!/usr/bin/env nodeimport { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 3818:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const semver = __nccwpck_require__(1383)

const permanentModules = [
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'https',
  'module',
  'net',
  'os',
  'path',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'vm',
  'zlib'
]

const versionLockedModules = {
  freelist: '<6.0.0',
  v8: '>=1.0.0',
  process: '>=1.1.0',
  inspector: '>=8.0.0',
  async_hooks: '>=8.1.0',
  http2: '>=8.4.0',
  perf_hooks: '>=8.5.0',
  trace_events: '>=10.0.0',
  worker_threads: '>=12.0.0',
  'node:test': '>=18.0.0'
}

const experimentalModules = {
  worker_threads: '>=10.5.0',
  wasi: '>=12.16.0',
  diagnostics_channel: '^14.17.0 || >=15.1.0'
}

module.exports = ({ version = process.version, experimental = false } = {}) => {
  const builtins = [...permanentModules]

  for (const [name, semverRange] of Object.entries(versionLockedModules)) {
    if (version === '*' || semver.satisfies(version, semverRange)) {
      builtins.push(name)
    }
  }

  if (experimental) {
    for (const [name, semverRange] of Object.entries(experimentalModules)) {
      if (
        !builtins.includes(name) &&
        (version === '*' || semver.satisfies(version, semverRange))
      ) {
        builtins.push(name)
      }
    }
  }

  return builtins
}


/***/ }),

/***/ 1904:
/***/ ((module, exports, __nccwpck_require__) => {

/**
 * Module dependencies.
 */

var EventEmitter = (__nccwpck_require__(2361).EventEmitter);
var spawn = (__nccwpck_require__(2081).spawn);
var path = __nccwpck_require__(1017);
var dirname = path.dirname;
var basename = path.basename;
var fs = __nccwpck_require__(7147);

/**
 * Inherit `Command` from `EventEmitter.prototype`.
 */

(__nccwpck_require__(3837).inherits)(Command, EventEmitter);

/**
 * Expose the root command.
 */

exports = module.exports = new Command();

/**
 * Expose `Command`.
 */

exports.Command = Command;

/**
 * Expose `Option`.
 */

exports.Option = Option;

/**
 * Initialize a new `Option` with the given `flags` and `description`.
 *
 * @param {String} flags
 * @param {String} description
 * @api public
 */

function Option(flags, description) {
  this.flags = flags;
  this.required = flags.indexOf('<') >= 0;
  this.optional = flags.indexOf('[') >= 0;
  this.bool = flags.indexOf('-no-') === -1;
  flags = flags.split(/[ ,|]+/);
  if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
  this.long = flags.shift();
  this.description = description || '';
}

/**
 * Return option name.
 *
 * @return {String}
 * @api private
 */

Option.prototype.name = function() {
  return this.long
    .replace('--', '')
    .replace('no-', '');
};

/**
 * Return option name, in a camelcase format that can be used
 * as a object attribute key.
 *
 * @return {String}
 * @api private
 */

Option.prototype.attributeName = function() {
  return camelcase(this.name());
};

/**
 * Check if `arg` matches the short or long flag.
 *
 * @param {String} arg
 * @return {Boolean}
 * @api private
 */

Option.prototype.is = function(arg) {
  return this.short === arg || this.long === arg;
};

/**
 * Initialize a new `Command`.
 *
 * @param {String} name
 * @api public
 */

function Command(name) {
  this.commands = [];
  this.options = [];
  this._execs = {};
  this._allowUnknownOption = false;
  this._args = [];
  this._name = name || '';
}

/**
 * Add command `name`.
 *
 * The `.action()` callback is invoked when the
 * command `name` is specified via __ARGV__,
 * and the remaining arguments are applied to the
 * function for access.
 *
 * When the `name` is "*" an un-matched command
 * will be passed as the first arg, followed by
 * the rest of __ARGV__ remaining.
 *
 * Examples:
 *
 *      program
 *        .version('0.0.1')
 *        .option('-C, --chdir <path>', 'change the working directory')
 *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
 *        .option('-T, --no-tests', 'ignore test hook')
 *
 *      program
 *        .command('setup')
 *        .description('run remote setup commands')
 *        .action(function() {
 *          console.log('setup');
 *        });
 *
 *      program
 *        .command('exec <cmd>')
 *        .description('run the given remote command')
 *        .action(function(cmd) {
 *          console.log('exec "%s"', cmd);
 *        });
 *
 *      program
 *        .command('teardown <dir> [otherDirs...]')
 *        .description('run teardown commands')
 *        .action(function(dir, otherDirs) {
 *          console.log('dir "%s"', dir);
 *          if (otherDirs) {
 *            otherDirs.forEach(function (oDir) {
 *              console.log('dir "%s"', oDir);
 *            });
 *          }
 *        });
 *
 *      program
 *        .command('*')
 *        .description('deploy the given env')
 *        .action(function(env) {
 *          console.log('deploying "%s"', env);
 *        });
 *
 *      program.parse(process.argv);
  *
 * @param {String} name
 * @param {String} [desc] for git-style sub-commands
 * @return {Command} the new command
 * @api public
 */

Command.prototype.command = function(name, desc, opts) {
  if (typeof desc === 'object' && desc !== null) {
    opts = desc;
    desc = null;
  }
  opts = opts || {};
  var args = name.split(/ +/);
  var cmd = new Command(args.shift());

  if (desc) {
    cmd.description(desc);
    this.executables = true;
    this._execs[cmd._name] = true;
    if (opts.isDefault) this.defaultExecutable = cmd._name;
  }
  cmd._noHelp = !!opts.noHelp;
  this.commands.push(cmd);
  cmd.parseExpectedArgs(args);
  cmd.parent = this;

  if (desc) return this;
  return cmd;
};

/**
 * Define argument syntax for the top-level command.
 *
 * @api public
 */

Command.prototype.arguments = function(desc) {
  return this.parseExpectedArgs(desc.split(/ +/));
};

/**
 * Add an implicit `help [cmd]` subcommand
 * which invokes `--help` for the given command.
 *
 * @api private
 */

Command.prototype.addImplicitHelpCommand = function() {
  this.command('help [cmd]', 'display help for [cmd]');
};

/**
 * Parse expected `args`.
 *
 * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parseExpectedArgs = function(args) {
  if (!args.length) return;
  var self = this;
  args.forEach(function(arg) {
    var argDetails = {
      required: false,
      name: '',
      variadic: false
    };

    switch (arg[0]) {
      case '<':
        argDetails.required = true;
        argDetails.name = arg.slice(1, -1);
        break;
      case '[':
        argDetails.name = arg.slice(1, -1);
        break;
    }

    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
      argDetails.variadic = true;
      argDetails.name = argDetails.name.slice(0, -3);
    }
    if (argDetails.name) {
      self._args.push(argDetails);
    }
  });
  return this;
};

/**
 * Register callback `fn` for the command.
 *
 * Examples:
 *
 *      program
 *        .command('help')
 *        .description('display verbose help')
 *        .action(function() {
 *           // output help here
 *        });
 *
 * @param {Function} fn
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.action = function(fn) {
  var self = this;
  var listener = function(args, unknown) {
    // Parse any so-far unknown options
    args = args || [];
    unknown = unknown || [];

    var parsed = self.parseOptions(unknown);

    // Output help if necessary
    outputHelpIfNecessary(self, parsed.unknown);

    // If there are still any unknown options, then we simply
    // die, unless someone asked for help, in which case we give it
    // to them, and then we die.
    if (parsed.unknown.length > 0) {
      self.unknownOption(parsed.unknown[0]);
    }

    // Leftover arguments need to be pushed back. Fixes issue #56
    if (parsed.args.length) args = parsed.args.concat(args);

    self._args.forEach(function(arg, i) {
      if (arg.required && args[i] == null) {
        self.missingArgument(arg.name);
      } else if (arg.variadic) {
        if (i !== self._args.length - 1) {
          self.variadicArgNotLast(arg.name);
        }

        args[i] = args.splice(i);
      }
    });

    // Always append ourselves to the end of the arguments,
    // to make sure we match the number of arguments the user
    // expects
    if (self._args.length) {
      args[self._args.length] = self;
    } else {
      args.push(self);
    }

    fn.apply(self, args);
  };
  var parent = this.parent || this;
  var name = parent === this ? '*' : this._name;
  parent.on('command:' + name, listener);
  if (this._alias) parent.on('command:' + this._alias, listener);
  return this;
};

/**
 * Define option with `flags`, `description` and optional
 * coercion `fn`.
 *
 * The `flags` string should contain both the short and long flags,
 * separated by comma, a pipe or space. The following are all valid
 * all will output this way when `--help` is used.
 *
 *    "-p, --pepper"
 *    "-p|--pepper"
 *    "-p --pepper"
 *
 * Examples:
 *
 *     // simple boolean defaulting to false
 *     program.option('-p, --pepper', 'add pepper');
 *
 *     --pepper
 *     program.pepper
 *     // => Boolean
 *
 *     // simple boolean defaulting to true
 *     program.option('-C, --no-cheese', 'remove cheese');
 *
 *     program.cheese
 *     // => true
 *
 *     --no-cheese
 *     program.cheese
 *     // => false
 *
 *     // required argument
 *     program.option('-C, --chdir <path>', 'change the working directory');
 *
 *     --chdir /tmp
 *     program.chdir
 *     // => "/tmp"
 *
 *     // optional argument
 *     program.option('-c, --cheese [type]', 'add cheese [marble]');
 *
 * @param {String} flags
 * @param {String} description
 * @param {Function|*} [fn] or default
 * @param {*} [defaultValue]
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.option = function(flags, description, fn, defaultValue) {
  var self = this,
    option = new Option(flags, description),
    oname = option.name(),
    name = option.attributeName();

  // default as 3rd arg
  if (typeof fn !== 'function') {
    if (fn instanceof RegExp) {
      var regex = fn;
      fn = function(val, def) {
        var m = regex.exec(val);
        return m ? m[0] : def;
      };
    } else {
      defaultValue = fn;
      fn = null;
    }
  }

  // preassign default value only for --no-*, [optional], or <required>
  if (!option.bool || option.optional || option.required) {
    // when --no-* we make sure default is true
    if (!option.bool) defaultValue = true;
    // preassign only if we have a default
    if (defaultValue !== undefined) {
      self[name] = defaultValue;
      option.defaultValue = defaultValue;
    }
  }

  // register the option
  this.options.push(option);

  // when it's passed assign the value
  // and conditionally invoke the callback
  this.on('option:' + oname, function(val) {
    // coercion
    if (val !== null && fn) {
      val = fn(val, self[name] === undefined ? defaultValue : self[name]);
    }

    // unassigned or bool
    if (typeof self[name] === 'boolean' || typeof self[name] === 'undefined') {
      // if no value, bool true, and we have a default, then use it!
      if (val == null) {
        self[name] = option.bool
          ? defaultValue || true
          : false;
      } else {
        self[name] = val;
      }
    } else if (val !== null) {
      // reassign
      self[name] = val;
    }
  });

  return this;
};

/**
 * Allow unknown options on the command line.
 *
 * @param {Boolean} arg if `true` or omitted, no error will be thrown
 * for unknown options.
 * @api public
 */
Command.prototype.allowUnknownOption = function(arg) {
  this._allowUnknownOption = arguments.length === 0 || arg;
  return this;
};

/**
 * Parse `argv`, settings options and invoking commands when defined.
 *
 * @param {Array} argv
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parse = function(argv) {
  // implicit help
  if (this.executables) this.addImplicitHelpCommand();

  // store raw args
  this.rawArgs = argv;

  // guess name
  this._name = this._name || basename(argv[1], '.js');

  // github-style sub-commands with no sub-command
  if (this.executables && argv.length < 3 && !this.defaultExecutable) {
    // this user needs help
    argv.push('--help');
  }

  // process argv
  var parsed = this.parseOptions(this.normalize(argv.slice(2)));
  var args = this.args = parsed.args;

  var result = this.parseArgs(this.args, parsed.unknown);

  // executable sub-commands
  var name = result.args[0];

  var aliasCommand = null;
  // check alias of sub commands
  if (name) {
    aliasCommand = this.commands.filter(function(command) {
      return command.alias() === name;
    })[0];
  }

  if (this._execs[name] && typeof this._execs[name] !== 'function') {
    return this.executeSubCommand(argv, args, parsed.unknown);
  } else if (aliasCommand) {
    // is alias of a subCommand
    args[0] = aliasCommand._name;
    return this.executeSubCommand(argv, args, parsed.unknown);
  } else if (this.defaultExecutable) {
    // use the default subcommand
    args.unshift(this.defaultExecutable);
    return this.executeSubCommand(argv, args, parsed.unknown);
  }

  return result;
};

/**
 * Execute a sub-command executable.
 *
 * @param {Array} argv
 * @param {Array} args
 * @param {Array} unknown
 * @api private
 */

Command.prototype.executeSubCommand = function(argv, args, unknown) {
  args = args.concat(unknown);

  if (!args.length) this.help();
  if (args[0] === 'help' && args.length === 1) this.help();

  // <cmd> --help
  if (args[0] === 'help') {
    args[0] = args[1];
    args[1] = '--help';
  }

  // executable
  var f = argv[1];
  // name of the subcommand, link `pm-install`
  var bin = basename(f, path.extname(f)) + '-' + args[0];

  // In case of globally installed, get the base dir where executable
  //  subcommand file should be located at
  var baseDir;

  var resolvedLink = fs.realpathSync(f);

  baseDir = dirname(resolvedLink);

  // prefer local `./<bin>` to bin in the $PATH
  var localBin = path.join(baseDir, bin);

  // whether bin file is a js script with explicit `.js` or `.ts` extension
  var isExplicitJS = false;
  if (exists(localBin + '.js')) {
    bin = localBin + '.js';
    isExplicitJS = true;
  } else if (exists(localBin + '.ts')) {
    bin = localBin + '.ts';
    isExplicitJS = true;
  } else if (exists(localBin)) {
    bin = localBin;
  }

  args = args.slice(1);

  var proc;
  if (process.platform !== 'win32') {
    if (isExplicitJS) {
      args.unshift(bin);
      // add executable arguments to spawn
      args = (process.execArgv || []).concat(args);

      proc = spawn(process.argv[0], args, { stdio: 'inherit', customFds: [0, 1, 2] });
    } else {
      proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
    }
  } else {
    args.unshift(bin);
    proc = spawn(process.execPath, args, { stdio: 'inherit' });
  }

  var signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
  signals.forEach(function(signal) {
    process.on(signal, function() {
      if (proc.killed === false && proc.exitCode === null) {
        proc.kill(signal);
      }
    });
  });
  proc.on('close', process.exit.bind(process));
  proc.on('error', function(err) {
    if (err.code === 'ENOENT') {
      console.error('error: %s(1) does not exist, try --help', bin);
    } else if (err.code === 'EACCES') {
      console.error('error: %s(1) not executable. try chmod or run with root', bin);
    }
    process.exit(1);
  });

  // Store the reference to the child process
  this.runningCommand = proc;
};

/**
 * Normalize `args`, splitting joined short flags. For example
 * the arg "-abc" is equivalent to "-a -b -c".
 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
 *
 * @param {Array} args
 * @return {Array}
 * @api private
 */

Command.prototype.normalize = function(args) {
  var ret = [],
    arg,
    lastOpt,
    index;

  for (var i = 0, len = args.length; i < len; ++i) {
    arg = args[i];
    if (i > 0) {
      lastOpt = this.optionFor(args[i - 1]);
    }

    if (arg === '--') {
      // Honor option terminator
      ret = ret.concat(args.slice(i));
      break;
    } else if (lastOpt && lastOpt.required) {
      ret.push(arg);
    } else if (arg.length > 1 && arg[0] === '-' && arg[1] !== '-') {
      arg.slice(1).split('').forEach(function(c) {
        ret.push('-' + c);
      });
    } else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
      ret.push(arg.slice(0, index), arg.slice(index + 1));
    } else {
      ret.push(arg);
    }
  }

  return ret;
};

/**
 * Parse command `args`.
 *
 * When listener(s) are available those
 * callbacks are invoked, otherwise the "*"
 * event is emitted and those actions are invoked.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api private
 */

Command.prototype.parseArgs = function(args, unknown) {
  var name;

  if (args.length) {
    name = args[0];
    if (this.listeners('command:' + name).length) {
      this.emit('command:' + args.shift(), args, unknown);
    } else {
      this.emit('command:*', args);
    }
  } else {
    outputHelpIfNecessary(this, unknown);

    // If there were no args and we have unknown options,
    // then they are extraneous and we need to error.
    if (unknown.length > 0) {
      this.unknownOption(unknown[0]);
    }
    if (this.commands.length === 0 &&
        this._args.filter(function(a) { return a.required; }).length === 0) {
      this.emit('command:*');
    }
  }

  return this;
};

/**
 * Return an option matching `arg` if any.
 *
 * @param {String} arg
 * @return {Option}
 * @api private
 */

Command.prototype.optionFor = function(arg) {
  for (var i = 0, len = this.options.length; i < len; ++i) {
    if (this.options[i].is(arg)) {
      return this.options[i];
    }
  }
};

/**
 * Parse options from `argv` returning `argv`
 * void of these options.
 *
 * @param {Array} argv
 * @return {Array}
 * @api public
 */

Command.prototype.parseOptions = function(argv) {
  var args = [],
    len = argv.length,
    literal,
    option,
    arg;

  var unknownOptions = [];

  // parse options
  for (var i = 0; i < len; ++i) {
    arg = argv[i];

    // literal args after --
    if (literal) {
      args.push(arg);
      continue;
    }

    if (arg === '--') {
      literal = true;
      continue;
    }

    // find matching Option
    option = this.optionFor(arg);

    // option is defined
    if (option) {
      // requires arg
      if (option.required) {
        arg = argv[++i];
        if (arg == null) return this.optionMissingArgument(option);
        this.emit('option:' + option.name(), arg);
      // optional arg
      } else if (option.optional) {
        arg = argv[i + 1];
        if (arg == null || (arg[0] === '-' && arg !== '-')) {
          arg = null;
        } else {
          ++i;
        }
        this.emit('option:' + option.name(), arg);
      // bool
      } else {
        this.emit('option:' + option.name());
      }
      continue;
    }

    // looks like an option
    if (arg.length > 1 && arg[0] === '-') {
      unknownOptions.push(arg);

      // If the next argument looks like it might be
      // an argument for this option, we pass it on.
      // If it isn't, then it'll simply be ignored
      if ((i + 1) < argv.length && argv[i + 1][0] !== '-') {
        unknownOptions.push(argv[++i]);
      }
      continue;
    }

    // arg
    args.push(arg);
  }

  return { args: args, unknown: unknownOptions };
};

/**
 * Return an object containing options as key-value pairs
 *
 * @return {Object}
 * @api public
 */
Command.prototype.opts = function() {
  var result = {},
    len = this.options.length;

  for (var i = 0; i < len; i++) {
    var key = this.options[i].attributeName();
    result[key] = key === this._versionOptionName ? this._version : this[key];
  }
  return result;
};

/**
 * Argument `name` is missing.
 *
 * @param {String} name
 * @api private
 */

Command.prototype.missingArgument = function(name) {
  console.error("error: missing required argument `%s'", name);
  process.exit(1);
};

/**
 * `Option` is missing an argument, but received `flag` or nothing.
 *
 * @param {String} option
 * @param {String} flag
 * @api private
 */

Command.prototype.optionMissingArgument = function(option, flag) {
  if (flag) {
    console.error("error: option `%s' argument missing, got `%s'", option.flags, flag);
  } else {
    console.error("error: option `%s' argument missing", option.flags);
  }
  process.exit(1);
};

/**
 * Unknown option `flag`.
 *
 * @param {String} flag
 * @api private
 */

Command.prototype.unknownOption = function(flag) {
  if (this._allowUnknownOption) return;
  console.error("error: unknown option `%s'", flag);
  process.exit(1);
};

/**
 * Variadic argument with `name` is not the last argument as required.
 *
 * @param {String} name
 * @api private
 */

Command.prototype.variadicArgNotLast = function(name) {
  console.error("error: variadic arguments must be last `%s'", name);
  process.exit(1);
};

/**
 * Set the program version to `str`.
 *
 * This method auto-registers the "-V, --version" flag
 * which will print the version number when passed.
 *
 * @param {String} str
 * @param {String} [flags]
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.version = function(str, flags) {
  if (arguments.length === 0) return this._version;
  this._version = str;
  flags = flags || '-V, --version';
  var versionOption = new Option(flags, 'output the version number');
  this._versionOptionName = versionOption.long.substr(2) || 'version';
  this.options.push(versionOption);
  this.on('option:' + this._versionOptionName, function() {
    process.stdout.write(str + '\n');
    process.exit(0);
  });
  return this;
};

/**
 * Set the description to `str`.
 *
 * @param {String} str
 * @param {Object} argsDescription
 * @return {String|Command}
 * @api public
 */

Command.prototype.description = function(str, argsDescription) {
  if (arguments.length === 0) return this._description;
  this._description = str;
  this._argsDescription = argsDescription;
  return this;
};

/**
 * Set an alias for the command
 *
 * @param {String} alias
 * @return {String|Command}
 * @api public
 */

Command.prototype.alias = function(alias) {
  var command = this;
  if (this.commands.length !== 0) {
    command = this.commands[this.commands.length - 1];
  }

  if (arguments.length === 0) return command._alias;

  if (alias === command._name) throw new Error('Command alias can\'t be the same as its name');

  command._alias = alias;
  return this;
};

/**
 * Set / get the command usage `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.usage = function(str) {
  var args = this._args.map(function(arg) {
    return humanReadableArgName(arg);
  });

  var usage = '[options]' +
    (this.commands.length ? ' [command]' : '') +
    (this._args.length ? ' ' + args.join(' ') : '');

  if (arguments.length === 0) return this._usage || usage;
  this._usage = str;

  return this;
};

/**
 * Get or set the name of the command
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.name = function(str) {
  if (arguments.length === 0) return this._name;
  this._name = str;
  return this;
};

/**
 * Return prepared commands.
 *
 * @return {Array}
 * @api private
 */

Command.prototype.prepareCommands = function() {
  return this.commands.filter(function(cmd) {
    return !cmd._noHelp;
  }).map(function(cmd) {
    var args = cmd._args.map(function(arg) {
      return humanReadableArgName(arg);
    }).join(' ');

    return [
      cmd._name +
        (cmd._alias ? '|' + cmd._alias : '') +
        (cmd.options.length ? ' [options]' : '') +
        (args ? ' ' + args : ''),
      cmd._description
    ];
  });
};

/**
 * Return the largest command length.
 *
 * @return {Number}
 * @api private
 */

Command.prototype.largestCommandLength = function() {
  var commands = this.prepareCommands();
  return commands.reduce(function(max, command) {
    return Math.max(max, command[0].length);
  }, 0);
};

/**
 * Return the largest option length.
 *
 * @return {Number}
 * @api private
 */

Command.prototype.largestOptionLength = function() {
  var options = [].slice.call(this.options);
  options.push({
    flags: '-h, --help'
  });
  return options.reduce(function(max, option) {
    return Math.max(max, option.flags.length);
  }, 0);
};

/**
 * Return the largest arg length.
 *
 * @return {Number}
 * @api private
 */

Command.prototype.largestArgLength = function() {
  return this._args.reduce(function(max, arg) {
    return Math.max(max, arg.name.length);
  }, 0);
};

/**
 * Return the pad width.
 *
 * @return {Number}
 * @api private
 */

Command.prototype.padWidth = function() {
  var width = this.largestOptionLength();
  if (this._argsDescription && this._args.length) {
    if (this.largestArgLength() > width) {
      width = this.largestArgLength();
    }
  }

  if (this.commands && this.commands.length) {
    if (this.largestCommandLength() > width) {
      width = this.largestCommandLength();
    }
  }

  return width;
};

/**
 * Return help for options.
 *
 * @return {String}
 * @api private
 */

Command.prototype.optionHelp = function() {
  var width = this.padWidth();

  // Append the help information
  return this.options.map(function(option) {
    return pad(option.flags, width) + '  ' + option.description +
      ((option.bool && option.defaultValue !== undefined) ? ' (default: ' + JSON.stringify(option.defaultValue) + ')' : '');
  }).concat([pad('-h, --help', width) + '  ' + 'output usage information'])
    .join('\n');
};

/**
 * Return command help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.commandHelp = function() {
  if (!this.commands.length) return '';

  var commands = this.prepareCommands();
  var width = this.padWidth();

  return [
    'Commands:',
    commands.map(function(cmd) {
      var desc = cmd[1] ? '  ' + cmd[1] : '';
      return (desc ? pad(cmd[0], width) : cmd[0]) + desc;
    }).join('\n').replace(/^/gm, '  '),
    ''
  ].join('\n');
};

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.helpInformation = function() {
  var desc = [];
  if (this._description) {
    desc = [
      this._description,
      ''
    ];

    var argsDescription = this._argsDescription;
    if (argsDescription && this._args.length) {
      var width = this.padWidth();
      desc.push('Arguments:');
      desc.push('');
      this._args.forEach(function(arg) {
        desc.push('  ' + pad(arg.name, width) + '  ' + argsDescription[arg.name]);
      });
      desc.push('');
    }
  }

  var cmdName = this._name;
  if (this._alias) {
    cmdName = cmdName + '|' + this._alias;
  }
  var usage = [
    'Usage: ' + cmdName + ' ' + this.usage(),
    ''
  ];

  var cmds = [];
  var commandHelp = this.commandHelp();
  if (commandHelp) cmds = [commandHelp];

  var options = [
    'Options:',
    '' + this.optionHelp().replace(/^/gm, '  '),
    ''
  ];

  return usage
    .concat(desc)
    .concat(options)
    .concat(cmds)
    .join('\n');
};

/**
 * Output help information for this command
 *
 * @api public
 */

Command.prototype.outputHelp = function(cb) {
  if (!cb) {
    cb = function(passthru) {
      return passthru;
    };
  }
  process.stdout.write(cb(this.helpInformation()));
  this.emit('--help');
};

/**
 * Output help information and exit.
 *
 * @api public
 */

Command.prototype.help = function(cb) {
  this.outputHelp(cb);
  process.exit();
};

/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */

function camelcase(flag) {
  return flag.split('-').reduce(function(str, word) {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

/**
 * Output help information if necessary
 *
 * @param {Command} command to output help for
 * @param {Array} array of options to search for -h or --help
 * @api private
 */

function outputHelpIfNecessary(cmd, options) {
  options = options || [];
  for (var i = 0; i < options.length; i++) {
    if (options[i] === '--help' || options[i] === '-h') {
      cmd.outputHelp();
      process.exit(0);
    }
  }
}

/**
 * Takes an argument an returns its human readable equivalent for help usage.
 *
 * @param {Object} arg
 * @return {String}
 * @api private
 */

function humanReadableArgName(arg) {
  var nameOutput = arg.name + (arg.variadic === true ? '...' : '');

  return arg.required
    ? '<' + nameOutput + '>'
    : '[' + nameOutput + ']';
}

// for versions before node v0.8 when there weren't `fs.existsSync`
function exists(file) {
  try {
    if (fs.statSync(file).isFile()) {
      return true;
    }
  } catch (e) {
    return false;
  }
}


/***/ }),

/***/ 5215:
/***/ ((module) => {



const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

const $ = {
	enabled: !NODE_DISABLE_COLORS && TERM !== 'dumb' && FORCE_COLOR !== '0',

	// modifiers
	reset: init(0, 0),
	bold: init(1, 22),
	dim: init(2, 22),
	italic: init(3, 23),
	underline: init(4, 24),
	inverse: init(7, 27),
	hidden: init(8, 28),
	strikethrough: init(9, 29),

	// colors
	black: init(30, 39),
	red: init(31, 39),
	green: init(32, 39),
	yellow: init(33, 39),
	blue: init(34, 39),
	magenta: init(35, 39),
	cyan: init(36, 39),
	white: init(37, 39),
	gray: init(90, 39),
	grey: init(90, 39),

	// background colors
	bgBlack: init(40, 49),
	bgRed: init(41, 49),
	bgGreen: init(42, 49),
	bgYellow: init(43, 49),
	bgBlue: init(44, 49),
	bgMagenta: init(45, 49),
	bgCyan: init(46, 49),
	bgWhite: init(47, 49)
};

function run(arr, str) {
	let i=0, tmp, beg='', end='';
	for (; i < arr.length; i++) {
		tmp = arr[i];
		beg += tmp.open;
		end += tmp.close;
		if (str.includes(tmp.close)) {
			str = str.replace(tmp.rgx, tmp.close + tmp.open);
		}
	}
	return beg + str + end;
}

function chain(has, keys) {
	let ctx = { has, keys };

	ctx.reset = $.reset.bind(ctx);
	ctx.bold = $.bold.bind(ctx);
	ctx.dim = $.dim.bind(ctx);
	ctx.italic = $.italic.bind(ctx);
	ctx.underline = $.underline.bind(ctx);
	ctx.inverse = $.inverse.bind(ctx);
	ctx.hidden = $.hidden.bind(ctx);
	ctx.strikethrough = $.strikethrough.bind(ctx);

	ctx.black = $.black.bind(ctx);
	ctx.red = $.red.bind(ctx);
	ctx.green = $.green.bind(ctx);
	ctx.yellow = $.yellow.bind(ctx);
	ctx.blue = $.blue.bind(ctx);
	ctx.magenta = $.magenta.bind(ctx);
	ctx.cyan = $.cyan.bind(ctx);
	ctx.white = $.white.bind(ctx);
	ctx.gray = $.gray.bind(ctx);
	ctx.grey = $.grey.bind(ctx);

	ctx.bgBlack = $.bgBlack.bind(ctx);
	ctx.bgRed = $.bgRed.bind(ctx);
	ctx.bgGreen = $.bgGreen.bind(ctx);
	ctx.bgYellow = $.bgYellow.bind(ctx);
	ctx.bgBlue = $.bgBlue.bind(ctx);
	ctx.bgMagenta = $.bgMagenta.bind(ctx);
	ctx.bgCyan = $.bgCyan.bind(ctx);
	ctx.bgWhite = $.bgWhite.bind(ctx);

	return ctx;
}

function init(open, close) {
	let blk = {
		open: `\x1b[${open}m`,
		close: `\x1b[${close}m`,
		rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
	};
	return function (txt) {
		if (this !== void 0 && this.has !== void 0) {
			this.has.includes(open) || (this.has.push(open),this.keys.push(blk));
			return txt === void 0 ? this : $.enabled ? run(this.keys, txt+'') : txt+'';
		}
		return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt+'') : txt+'';
	};
}

module.exports = $;


/***/ }),

/***/ 7129:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



// A linked list to keep track of recently-used-ness
const Yallist = __nccwpck_require__(665)

const MAX = Symbol('max')
const LENGTH = Symbol('length')
const LENGTH_CALCULATOR = Symbol('lengthCalculator')
const ALLOW_STALE = Symbol('allowStale')
const MAX_AGE = Symbol('maxAge')
const DISPOSE = Symbol('dispose')
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet')
const LRU_LIST = Symbol('lruList')
const CACHE = Symbol('cache')
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet')

const naiveLength = () => 1

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options }

    if (!options)
      options = {}

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    const max = this[MAX] = options.max || Infinity

    const lc = options.length || naiveLength
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc
    this[ALLOW_STALE] = options.stale || false
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0
    this[DISPOSE] = options.dispose
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
    this.reset()
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity
    trim(this)
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA
    trim(this)
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC
      this[LENGTH] = 0
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
        this[LENGTH] += hit.length
      })
    }
    trim(this)
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev
      forEachStep(this, fn, walker, thisp)
      walker = prev
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next
      forEachStep(this, fn, walker, thisp)
      walker = next
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value))
    }

    this[CACHE] = new Map() // hash of items by key
    this[LRU_LIST] = new Yallist() // list of items in order of use recency
    this[LENGTH] = 0 // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE]

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0
    const len = this[LENGTH_CALCULATOR](value, key)

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key))
        return false
      }

      const node = this[CACHE].get(key)
      const item = node.value

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value)
      }

      item.now = now
      item.maxAge = maxAge
      item.value = value
      this[LENGTH] += len - item.length
      item.length = len
      this.get(key)
      trim(this)
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge)

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value)

      return false
    }

    this[LENGTH] += hit.length
    this[LRU_LIST].unshift(hit)
    this[CACHE].set(key, this[LRU_LIST].head)
    trim(this)
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail
    if (!node)
      return null

    del(this, node)
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key))
  }

  load (arr) {
    // reset the cache
    this.reset()

    const now = Date.now()
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l]
      const expiresAt = hit.e || 0
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v)
      else {
        const maxAge = expiresAt - now
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge)
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false))
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key)
  if (node) {
    const hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now()
        self[LRU_LIST].unshiftNode(node)
      }
    }
    return hit.value
  }
}

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
}

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}

const del = (self, node) => {
  if (node) {
    const hit = node.value
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value)

    self[LENGTH] -= hit.length
    self[CACHE].delete(hit.key)
    self[LRU_LIST].removeNode(node)
  }
}

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key
    this.value = value
    this.length = length
    this.now = now
    this.maxAge = maxAge || 0
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value
  if (isStale(self, hit)) {
    del(self, node)
    if (!self[ALLOW_STALE])
      hit = undefined
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self)
}

module.exports = LRUCache


/***/ }),

/***/ 7280:
/***/ ((module) => {



class DatePart {
  constructor({
    token,
    date,
    parts,
    locales
  }) {
    this.token = token;
    this.date = date || new Date();
    this.parts = parts || [this];
    this.locales = locales || {};
  }

  up() {}

  down() {}

  next() {
    const currentIdx = this.parts.indexOf(this);
    return this.parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
  }

  setTo(val) {}

  prev() {
    let parts = [].concat(this.parts).reverse();
    const currentIdx = parts.indexOf(this);
    return parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
  }

  toString() {
    return String(this.date);
  }

}

module.exports = DatePart;

/***/ }),

/***/ 4203:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

const pos = n => {
  n = n % 10;
  return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
};

class Day extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setDate(this.date.getDate() + 1);
  }

  down() {
    this.date.setDate(this.date.getDate() - 1);
  }

  setTo(val) {
    this.date.setDate(parseInt(val.substr(-2)));
  }

  toString() {
    let date = this.date.getDate();
    let day = this.date.getDay();
    return this.token === 'DD' ? String(date).padStart(2, '0') : this.token === 'Do' ? date + pos(date) : this.token === 'd' ? day + 1 : this.token === 'ddd' ? this.locales.weekdaysShort[day] : this.token === 'dddd' ? this.locales.weekdays[day] : date;
  }

}

module.exports = Day;

/***/ }),

/***/ 2574:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

class Hours extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setHours(this.date.getHours() + 1);
  }

  down() {
    this.date.setHours(this.date.getHours() - 1);
  }

  setTo(val) {
    this.date.setHours(parseInt(val.substr(-2)));
  }

  toString() {
    let hours = this.date.getHours();
    if (/h/.test(this.token)) hours = hours % 12 || 12;
    return this.token.length > 1 ? String(hours).padStart(2, '0') : hours;
  }

}

module.exports = Hours;

/***/ }),

/***/ 2408:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



module.exports = {
  DatePart: __nccwpck_require__(7280),
  Meridiem: __nccwpck_require__(4853),
  Day: __nccwpck_require__(4203),
  Hours: __nccwpck_require__(2574),
  Milliseconds: __nccwpck_require__(4909),
  Minutes: __nccwpck_require__(5876),
  Month: __nccwpck_require__(9461),
  Seconds: __nccwpck_require__(5884),
  Year: __nccwpck_require__(359)
};

/***/ }),

/***/ 4853:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

class Meridiem extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setHours((this.date.getHours() + 12) % 24);
  }

  down() {
    this.up();
  }

  toString() {
    let meridiem = this.date.getHours() > 12 ? 'pm' : 'am';
    return /\A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
  }

}

module.exports = Meridiem;

/***/ }),

/***/ 4909:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

class Milliseconds extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
  }

  down() {
    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
  }

  setTo(val) {
    this.date.setMilliseconds(parseInt(val.substr(-this.token.length)));
  }

  toString() {
    return String(this.date.getMilliseconds()).padStart(4, '0').substr(0, this.token.length);
  }

}

module.exports = Milliseconds;

/***/ }),

/***/ 5876:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

class Minutes extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setMinutes(this.date.getMinutes() + 1);
  }

  down() {
    this.date.setMinutes(this.date.getMinutes() - 1);
  }

  setTo(val) {
    this.date.setMinutes(parseInt(val.substr(-2)));
  }

  toString() {
    let m = this.date.getMinutes();
    return this.token.length > 1 ? String(m).padStart(2, '0') : m;
  }

}

module.exports = Minutes;

/***/ }),

/***/ 9461:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

class Month extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setMonth(this.date.getMonth() + 1);
  }

  down() {
    this.date.setMonth(this.date.getMonth() - 1);
  }

  setTo(val) {
    val = parseInt(val.substr(-2)) - 1;
    this.date.setMonth(val < 0 ? 0 : val);
  }

  toString() {
    let month = this.date.getMonth();
    let tl = this.token.length;
    return tl === 2 ? String(month + 1).padStart(2, '0') : tl === 3 ? this.locales.monthsShort[month] : tl === 4 ? this.locales.months[month] : String(month + 1);
  }

}

module.exports = Month;

/***/ }),

/***/ 5884:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

class Seconds extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setSeconds(this.date.getSeconds() + 1);
  }

  down() {
    this.date.setSeconds(this.date.getSeconds() - 1);
  }

  setTo(val) {
    this.date.setSeconds(parseInt(val.substr(-2)));
  }

  toString() {
    let s = this.date.getSeconds();
    return this.token.length > 1 ? String(s).padStart(2, '0') : s;
  }

}

module.exports = Seconds;

/***/ }),

/***/ 359:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(7280);

class Year extends DatePart {
  constructor(opts = {}) {
    super(opts);
  }

  up() {
    this.date.setFullYear(this.date.getFullYear() + 1);
  }

  down() {
    this.date.setFullYear(this.date.getFullYear() - 1);
  }

  setTo(val) {
    this.date.setFullYear(val.substr(-4));
  }

  toString() {
    let year = String(this.date.getFullYear()).padStart(4, '0');
    return this.token.length === 2 ? year.substr(-2) : year;
  }

}

module.exports = Year;

/***/ }),

/***/ 2257:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const color = __nccwpck_require__(5215);

const Prompt = __nccwpck_require__(461);

const _require = __nccwpck_require__(9571),
      erase = _require.erase,
      cursor = _require.cursor;

const _require2 = __nccwpck_require__(8091),
      style = _require2.style,
      clear = _require2.clear,
      figures = _require2.figures,
      wrap = _require2.wrap,
      entriesToDisplay = _require2.entriesToDisplay;

const getVal = (arr, i) => arr[i] && (arr[i].value || arr[i].title || arr[i]);

const getTitle = (arr, i) => arr[i] && (arr[i].title || arr[i].value || arr[i]);

const getIndex = (arr, valOrTitle) => {
  const index = arr.findIndex(el => el.value === valOrTitle || el.title === valOrTitle);
  return index > -1 ? index : undefined;
};
/**
 * TextPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of auto-complete choices objects
 * @param {Function} [opts.suggest] Filter function. Defaults to sort by title
 * @param {Number} [opts.limit=10] Max number of results to show
 * @param {Number} [opts.cursor=0] Cursor start position
 * @param {String} [opts.style='default'] Render style
 * @param {String} [opts.fallback] Fallback message - initial to default value
 * @param {String} [opts.initial] Index of the default value
 * @param {Boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.noMatches] The no matches found label
 */


class AutocompletePrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.suggest = opts.suggest;
    this.choices = opts.choices;
    this.initial = typeof opts.initial === 'number' ? opts.initial : getIndex(opts.choices, opts.initial);
    this.select = this.initial || opts.cursor || 0;
    this.i18n = {
      noMatches: opts.noMatches || 'no matches found'
    };
    this.fallback = opts.fallback || this.initial;
    this.clearFirst = opts.clearFirst || false;
    this.suggestions = [];
    this.input = '';
    this.limit = opts.limit || 10;
    this.cursor = 0;
    this.transform = style.render(opts.style);
    this.scale = this.transform.scale;
    this.render = this.render.bind(this);
    this.complete = this.complete.bind(this);
    this.clear = clear('', this.out.columns);
    this.complete(this.render);
    this.render();
  }

  set fallback(fb) {
    this._fb = Number.isSafeInteger(parseInt(fb)) ? parseInt(fb) : fb;
  }

  get fallback() {
    let choice;
    if (typeof this._fb === 'number') choice = this.choices[this._fb];else if (typeof this._fb === 'string') choice = {
      title: this._fb
    };
    return choice || this._fb || {
      title: this.i18n.noMatches
    };
  }

  moveSelect(i) {
    this.select = i;
    if (this.suggestions.length > 0) this.value = getVal(this.suggestions, i);else this.value = this.fallback.value;
    this.fire();
  }

  complete(cb) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const p = _this.completing = _this.suggest(_this.input, _this.choices);

      const suggestions = yield p;
      if (_this.completing !== p) return;
      _this.suggestions = suggestions.map((s, i, arr) => ({
        title: getTitle(arr, i),
        value: getVal(arr, i),
        description: s.description
      }));
      _this.completing = false;
      const l = Math.max(suggestions.length - 1, 0);

      _this.moveSelect(Math.min(l, _this.select));

      cb && cb();
    })();
  }

  reset() {
    this.input = '';
    this.complete(() => {
      this.moveSelect(this.initial !== void 0 ? this.initial : 0);
      this.render();
    });
    this.render();
  }

  exit() {
    if (this.clearFirst && this.input.length > 0) {
      this.reset();
    } else {
      this.done = this.exited = true;
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write('\n');
      this.close();
    }
  }

  abort() {
    this.done = this.aborted = true;
    this.exited = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.done = true;
    this.aborted = this.exited = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  _(c, key) {
    let s1 = this.input.slice(0, this.cursor);
    let s2 = this.input.slice(this.cursor);
    this.input = `${s1}${c}${s2}`;
    this.cursor = s1.length + 1;
    this.complete(this.render);
    this.render();
  }

  delete() {
    if (this.cursor === 0) return this.bell();
    let s1 = this.input.slice(0, this.cursor - 1);
    let s2 = this.input.slice(this.cursor);
    this.input = `${s1}${s2}`;
    this.complete(this.render);
    this.cursor = this.cursor - 1;
    this.render();
  }

  deleteForward() {
    if (this.cursor * this.scale >= this.rendered.length) return this.bell();
    let s1 = this.input.slice(0, this.cursor);
    let s2 = this.input.slice(this.cursor + 1);
    this.input = `${s1}${s2}`;
    this.complete(this.render);
    this.render();
  }

  first() {
    this.moveSelect(0);
    this.render();
  }

  last() {
    this.moveSelect(this.suggestions.length - 1);
    this.render();
  }

  up() {
    if (this.select === 0) {
      this.moveSelect(this.suggestions.length - 1);
    } else {
      this.moveSelect(this.select - 1);
    }

    this.render();
  }

  down() {
    if (this.select === this.suggestions.length - 1) {
      this.moveSelect(0);
    } else {
      this.moveSelect(this.select + 1);
    }

    this.render();
  }

  next() {
    if (this.select === this.suggestions.length - 1) {
      this.moveSelect(0);
    } else this.moveSelect(this.select + 1);

    this.render();
  }

  nextPage() {
    this.moveSelect(Math.min(this.select + this.limit, this.suggestions.length - 1));
    this.render();
  }

  prevPage() {
    this.moveSelect(Math.max(this.select - this.limit, 0));
    this.render();
  }

  left() {
    if (this.cursor <= 0) return this.bell();
    this.cursor = this.cursor - 1;
    this.render();
  }

  right() {
    if (this.cursor * this.scale >= this.rendered.length) return this.bell();
    this.cursor = this.cursor + 1;
    this.render();
  }

  renderOption(v, hovered, isStart, isEnd) {
    let desc;
    let prefix = isStart ? figures.arrowUp : isEnd ? figures.arrowDown : ' ';
    let title = hovered ? color.cyan().underline(v.title) : v.title;
    prefix = (hovered ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;

    if (v.description) {
      desc = ` - ${v.description}`;

      if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
        desc = '\n' + wrap(v.description, {
          margin: 3,
          width: this.out.columns
        });
      }
    }

    return prefix + ' ' + title + color.gray(desc || '');
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
    super.render();

    let _entriesToDisplay = entriesToDisplay(this.select, this.choices.length, this.limit),
        startIndex = _entriesToDisplay.startIndex,
        endIndex = _entriesToDisplay.endIndex;

    this.outputText = [style.symbol(this.done, this.aborted, this.exited), color.bold(this.msg), style.delimiter(this.completing), this.done && this.suggestions[this.select] ? this.suggestions[this.select].title : this.rendered = this.transform.render(this.input)].join(' ');

    if (!this.done) {
      const suggestions = this.suggestions.slice(startIndex, endIndex).map((item, i) => this.renderOption(item, this.select === i + startIndex, i === 0 && startIndex > 0, i + startIndex === endIndex - 1 && endIndex < this.choices.length)).join('\n');
      this.outputText += `\n` + (suggestions || color.gray(this.fallback.title));
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }

}

module.exports = AutocompletePrompt;

/***/ }),

/***/ 5441:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);

const _require = __nccwpck_require__(9571),
      cursor = _require.cursor;

const MultiselectPrompt = __nccwpck_require__(4140);

const _require2 = __nccwpck_require__(8091),
      clear = _require2.clear,
      style = _require2.style,
      figures = _require2.figures;
/**
 * MultiselectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {String} [opts.warn] Hint shown for disabled choices
 * @param {Number} [opts.max] Max choices
 * @param {Number} [opts.cursor=0] Cursor start position
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */


class AutocompleteMultiselectPrompt extends MultiselectPrompt {
  constructor(opts = {}) {
    opts.overrideRender = true;
    super(opts);
    this.inputValue = '';
    this.clear = clear('', this.out.columns);
    this.filteredOptions = this.value;
    this.render();
  }

  last() {
    this.cursor = this.filteredOptions.length - 1;
    this.render();
  }

  next() {
    this.cursor = (this.cursor + 1) % this.filteredOptions.length;
    this.render();
  }

  up() {
    if (this.cursor === 0) {
      this.cursor = this.filteredOptions.length - 1;
    } else {
      this.cursor--;
    }

    this.render();
  }

  down() {
    if (this.cursor === this.filteredOptions.length - 1) {
      this.cursor = 0;
    } else {
      this.cursor++;
    }

    this.render();
  }

  left() {
    this.filteredOptions[this.cursor].selected = false;
    this.render();
  }

  right() {
    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
    this.filteredOptions[this.cursor].selected = true;
    this.render();
  }

  delete() {
    if (this.inputValue.length) {
      this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1);
      this.updateFilteredOptions();
    }
  }

  updateFilteredOptions() {
    const currentHighlight = this.filteredOptions[this.cursor];
    this.filteredOptions = this.value.filter(v => {
      if (this.inputValue) {
        if (typeof v.title === 'string') {
          if (v.title.toLowerCase().includes(this.inputValue.toLowerCase())) {
            return true;
          }
        }

        if (typeof v.value === 'string') {
          if (v.value.toLowerCase().includes(this.inputValue.toLowerCase())) {
            return true;
          }
        }

        return false;
      }

      return true;
    });
    const newHighlightIndex = this.filteredOptions.findIndex(v => v === currentHighlight);
    this.cursor = newHighlightIndex < 0 ? 0 : newHighlightIndex;
    this.render();
  }

  handleSpaceToggle() {
    const v = this.filteredOptions[this.cursor];

    if (v.selected) {
      v.selected = false;
      this.render();
    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
      return this.bell();
    } else {
      v.selected = true;
      this.render();
    }
  }

  handleInputChange(c) {
    this.inputValue = this.inputValue + c;
    this.updateFilteredOptions();
  }

  _(c, key) {
    if (c === ' ') {
      this.handleSpaceToggle();
    } else {
      this.handleInputChange(c);
    }
  }

  renderInstructions() {
    if (this.instructions === undefined || this.instructions) {
      if (typeof this.instructions === 'string') {
        return this.instructions;
      }

      return `
Instructions:
    ${figures.arrowUp}/${figures.arrowDown}: Highlight option
    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection
    [a,b,c]/delete: Filter choices
    enter/return: Complete answer
`;
    }

    return '';
  }

  renderCurrentInput() {
    return `
Filtered results for: ${this.inputValue ? this.inputValue : color.gray('Enter something to filter')}\n`;
  }

  renderOption(cursor, v, i) {
    let title;
    if (v.disabled) title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);else title = cursor === i ? color.cyan().underline(v.title) : v.title;
    return (v.selected ? color.green(figures.radioOn) : figures.radioOff) + '  ' + title;
  }

  renderDoneOrInstructions() {
    if (this.done) {
      return this.value.filter(e => e.selected).map(v => v.title).join(', ');
    }

    const output = [color.gray(this.hint), this.renderInstructions(), this.renderCurrentInput()];

    if (this.filteredOptions.length && this.filteredOptions[this.cursor].disabled) {
      output.push(color.yellow(this.warn));
    }

    return output.join(' ');
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    super.render(); // print prompt

    let prompt = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.renderDoneOrInstructions()].join(' ');

    if (this.showMinError) {
      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
      this.showMinError = false;
    }

    prompt += this.renderOptions(this.filteredOptions);
    this.out.write(this.clear + prompt);
    this.clear = clear(prompt, this.out.columns);
  }

}

module.exports = AutocompleteMultiselectPrompt;

/***/ }),

/***/ 9486:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);

const Prompt = __nccwpck_require__(461);

const _require = __nccwpck_require__(8091),
      style = _require.style,
      clear = _require.clear;

const _require2 = __nccwpck_require__(9571),
      erase = _require2.erase,
      cursor = _require2.cursor;
/**
 * ConfirmPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Boolean} [opts.initial] Default value (true/false)
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.yes] The "Yes" label
 * @param {String} [opts.yesOption] The "Yes" option when choosing between yes/no
 * @param {String} [opts.no] The "No" label
 * @param {String} [opts.noOption] The "No" option when choosing between yes/no
 */


class ConfirmPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.value = opts.initial;
    this.initialValue = !!opts.initial;
    this.yesMsg = opts.yes || 'yes';
    this.yesOption = opts.yesOption || '(Y/n)';
    this.noMsg = opts.no || 'no';
    this.noOption = opts.noOption || '(y/N)';
    this.render();
  }

  reset() {
    this.value = this.initialValue;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.value = this.value || false;
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  _(c, key) {
    if (c.toLowerCase() === 'y') {
      this.value = true;
      return this.submit();
    }

    if (c.toLowerCase() === 'n') {
      this.value = false;
      return this.submit();
    }

    return this.bell();
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
    super.render();
    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.done ? this.value ? this.yesMsg : this.noMsg : color.gray(this.initialValue ? this.yesOption : this.noOption)].join(' ');
    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }

}

module.exports = ConfirmPrompt;

/***/ }),

/***/ 4177:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const color = __nccwpck_require__(5215);

const Prompt = __nccwpck_require__(461);

const _require = __nccwpck_require__(8091),
      style = _require.style,
      clear = _require.clear,
      figures = _require.figures;

const _require2 = __nccwpck_require__(9571),
      erase = _require2.erase,
      cursor = _require2.cursor;

const _require3 = __nccwpck_require__(2408),
      DatePart = _require3.DatePart,
      Meridiem = _require3.Meridiem,
      Day = _require3.Day,
      Hours = _require3.Hours,
      Milliseconds = _require3.Milliseconds,
      Minutes = _require3.Minutes,
      Month = _require3.Month,
      Seconds = _require3.Seconds,
      Year = _require3.Year;

const regex = /\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g;
const regexGroups = {
  1: ({
    token
  }) => token.replace(/\\(.)/g, '$1'),
  2: opts => new Day(opts),
  // Day // TODO
  3: opts => new Month(opts),
  // Month
  4: opts => new Year(opts),
  // Year
  5: opts => new Meridiem(opts),
  // AM/PM // TODO (special)
  6: opts => new Hours(opts),
  // Hours
  7: opts => new Minutes(opts),
  // Minutes
  8: opts => new Seconds(opts),
  // Seconds
  9: opts => new Milliseconds(opts) // Fractional seconds

};
const dfltLocales = {
  months: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
  monthsShort: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
  weekdaysShort: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',')
};
/**
 * DatePrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Number} [opts.initial] Index of default value
 * @param {String} [opts.mask] The format mask
 * @param {object} [opts.locales] The date locales
 * @param {String} [opts.error] The error message shown on invalid value
 * @param {Function} [opts.validate] Function to validate the submitted value
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */

class DatePrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.cursor = 0;
    this.typed = '';
    this.locales = Object.assign(dfltLocales, opts.locales);
    this._date = opts.initial || new Date();
    this.errorMsg = opts.error || 'Please Enter A Valid Value';

    this.validator = opts.validate || (() => true);

    this.mask = opts.mask || 'YYYY-MM-DD HH:mm:ss';
    this.clear = clear('', this.out.columns);
    this.render();
  }

  get value() {
    return this.date;
  }

  get date() {
    return this._date;
  }

  set date(date) {
    if (date) this._date.setTime(date.getTime());
  }

  set mask(mask) {
    let result;
    this.parts = [];

    while (result = regex.exec(mask)) {
      let match = result.shift();
      let idx = result.findIndex(gr => gr != null);
      this.parts.push(idx in regexGroups ? regexGroups[idx]({
        token: result[idx] || match,
        date: this.date,
        parts: this.parts,
        locales: this.locales
      }) : result[idx] || match);
    }

    let parts = this.parts.reduce((arr, i) => {
      if (typeof i === 'string' && typeof arr[arr.length - 1] === 'string') arr[arr.length - 1] += i;else arr.push(i);
      return arr;
    }, []);
    this.parts.splice(0);
    this.parts.push(...parts);
    this.reset();
  }

  moveCursor(n) {
    this.typed = '';
    this.cursor = n;
    this.fire();
  }

  reset() {
    this.moveCursor(this.parts.findIndex(p => p instanceof DatePart));
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.error = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  validate() {
    var _this = this;

    return _asyncToGenerator(function* () {
      let valid = yield _this.validator(_this.value);

      if (typeof valid === 'string') {
        _this.errorMsg = valid;
        valid = false;
      }

      _this.error = !valid;
    })();
  }

  submit() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.validate();

      if (_this2.error) {
        _this2.color = 'red';

        _this2.fire();

        _this2.render();

        return;
      }

      _this2.done = true;
      _this2.aborted = false;

      _this2.fire();

      _this2.render();

      _this2.out.write('\n');

      _this2.close();
    })();
  }

  up() {
    this.typed = '';
    this.parts[this.cursor].up();
    this.render();
  }

  down() {
    this.typed = '';
    this.parts[this.cursor].down();
    this.render();
  }

  left() {
    let prev = this.parts[this.cursor].prev();
    if (prev == null) return this.bell();
    this.moveCursor(this.parts.indexOf(prev));
    this.render();
  }

  right() {
    let next = this.parts[this.cursor].next();
    if (next == null) return this.bell();
    this.moveCursor(this.parts.indexOf(next));
    this.render();
  }

  next() {
    let next = this.parts[this.cursor].next();
    this.moveCursor(next ? this.parts.indexOf(next) : this.parts.findIndex(part => part instanceof DatePart));
    this.render();
  }

  _(c) {
    if (/\d/.test(c)) {
      this.typed += c;
      this.parts[this.cursor].setTo(this.typed);
      this.render();
    }
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
    super.render(); // Print prompt

    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.parts.reduce((arr, p, idx) => arr.concat(idx === this.cursor && !this.done ? color.cyan().underline(p.toString()) : p), []).join('')].join(' '); // Print error

    if (this.error) {
      this.outputText += this.errorMsg.split('\n').reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }

}

module.exports = DatePrompt;

/***/ }),

/***/ 2838:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



module.exports = {
  TextPrompt: __nccwpck_require__(16),
  SelectPrompt: __nccwpck_require__(8614),
  TogglePrompt: __nccwpck_require__(8001),
  DatePrompt: __nccwpck_require__(4177),
  NumberPrompt: __nccwpck_require__(7072),
  MultiselectPrompt: __nccwpck_require__(4140),
  AutocompletePrompt: __nccwpck_require__(2257),
  AutocompleteMultiselectPrompt: __nccwpck_require__(5441),
  ConfirmPrompt: __nccwpck_require__(9486)
};

/***/ }),

/***/ 4140:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);

const _require = __nccwpck_require__(9571),
      cursor = _require.cursor;

const Prompt = __nccwpck_require__(461);

const _require2 = __nccwpck_require__(8091),
      clear = _require2.clear,
      figures = _require2.figures,
      style = _require2.style,
      wrap = _require2.wrap,
      entriesToDisplay = _require2.entriesToDisplay;
/**
 * MultiselectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {String} [opts.warn] Hint shown for disabled choices
 * @param {Number} [opts.max] Max choices
 * @param {Number} [opts.cursor=0] Cursor start position
 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */


class MultiselectPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.cursor = opts.cursor || 0;
    this.scrollIndex = opts.cursor || 0;
    this.hint = opts.hint || '';
    this.warn = opts.warn || '- This option is disabled -';
    this.minSelected = opts.min;
    this.showMinError = false;
    this.maxChoices = opts.max;
    this.instructions = opts.instructions;
    this.optionsPerPage = opts.optionsPerPage || 10;
    this.value = opts.choices.map((ch, idx) => {
      if (typeof ch === 'string') ch = {
        title: ch,
        value: idx
      };
      return {
        title: ch && (ch.title || ch.value || ch),
        description: ch && ch.description,
        value: ch && (ch.value === undefined ? idx : ch.value),
        selected: ch && ch.selected,
        disabled: ch && ch.disabled
      };
    });
    this.clear = clear('', this.out.columns);

    if (!opts.overrideRender) {
      this.render();
    }
  }

  reset() {
    this.value.map(v => !v.selected);
    this.cursor = 0;
    this.fire();
    this.render();
  }

  selected() {
    return this.value.filter(v => v.selected);
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    const selected = this.value.filter(e => e.selected);

    if (this.minSelected && selected.length < this.minSelected) {
      this.showMinError = true;
      this.render();
    } else {
      this.done = true;
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write('\n');
      this.close();
    }
  }

  first() {
    this.cursor = 0;
    this.render();
  }

  last() {
    this.cursor = this.value.length - 1;
    this.render();
  }

  next() {
    this.cursor = (this.cursor + 1) % this.value.length;
    this.render();
  }

  up() {
    if (this.cursor === 0) {
      this.cursor = this.value.length - 1;
    } else {
      this.cursor--;
    }

    this.render();
  }

  down() {
    if (this.cursor === this.value.length - 1) {
      this.cursor = 0;
    } else {
      this.cursor++;
    }

    this.render();
  }

  left() {
    this.value[this.cursor].selected = false;
    this.render();
  }

  right() {
    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
    this.value[this.cursor].selected = true;
    this.render();
  }

  handleSpaceToggle() {
    const v = this.value[this.cursor];

    if (v.selected) {
      v.selected = false;
      this.render();
    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
      return this.bell();
    } else {
      v.selected = true;
      this.render();
    }
  }

  toggleAll() {
    if (this.maxChoices !== undefined || this.value[this.cursor].disabled) {
      return this.bell();
    }

    const newSelected = !this.value[this.cursor].selected;
    this.value.filter(v => !v.disabled).forEach(v => v.selected = newSelected);
    this.render();
  }

  _(c, key) {
    if (c === ' ') {
      this.handleSpaceToggle();
    } else if (c === 'a') {
      this.toggleAll();
    } else {
      return this.bell();
    }
  }

  renderInstructions() {
    if (this.instructions === undefined || this.instructions) {
      if (typeof this.instructions === 'string') {
        return this.instructions;
      }

      return '\nInstructions:\n' + `    ${figures.arrowUp}/${figures.arrowDown}: Highlight option\n` + `    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection\n` + (this.maxChoices === undefined ? `    a: Toggle all\n` : '') + `    enter/return: Complete answer`;
    }

    return '';
  }

  renderOption(cursor, v, i, arrowIndicator) {
    const prefix = (v.selected ? color.green(figures.radioOn) : figures.radioOff) + ' ' + arrowIndicator + ' ';
    let title, desc;

    if (v.disabled) {
      title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
    } else {
      title = cursor === i ? color.cyan().underline(v.title) : v.title;

      if (cursor === i && v.description) {
        desc = ` - ${v.description}`;

        if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
          desc = '\n' + wrap(v.description, {
            margin: prefix.length,
            width: this.out.columns
          });
        }
      }
    }

    return prefix + title + color.gray(desc || '');
  } // shared with autocompleteMultiselect


  paginateOptions(options) {
    if (options.length === 0) {
      return color.red('No matches for this query.');
    }

    let _entriesToDisplay = entriesToDisplay(this.cursor, options.length, this.optionsPerPage),
        startIndex = _entriesToDisplay.startIndex,
        endIndex = _entriesToDisplay.endIndex;

    let prefix,
        styledOptions = [];

    for (let i = startIndex; i < endIndex; i++) {
      if (i === startIndex && startIndex > 0) {
        prefix = figures.arrowUp;
      } else if (i === endIndex - 1 && endIndex < options.length) {
        prefix = figures.arrowDown;
      } else {
        prefix = ' ';
      }

      styledOptions.push(this.renderOption(this.cursor, options[i], i, prefix));
    }

    return '\n' + styledOptions.join('\n');
  } // shared with autocomleteMultiselect


  renderOptions(options) {
    if (!this.done) {
      return this.paginateOptions(options);
    }

    return '';
  }

  renderDoneOrInstructions() {
    if (this.done) {
      return this.value.filter(e => e.selected).map(v => v.title).join(', ');
    }

    const output = [color.gray(this.hint), this.renderInstructions()];

    if (this.value[this.cursor].disabled) {
      output.push(color.yellow(this.warn));
    }

    return output.join(' ');
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    super.render(); // print prompt

    let prompt = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.renderDoneOrInstructions()].join(' ');

    if (this.showMinError) {
      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
      this.showMinError = false;
    }

    prompt += this.renderOptions(this.value);
    this.out.write(this.clear + prompt);
    this.clear = clear(prompt, this.out.columns);
  }

}

module.exports = MultiselectPrompt;

/***/ }),

/***/ 7072:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const color = __nccwpck_require__(5215);

const Prompt = __nccwpck_require__(461);

const _require = __nccwpck_require__(9571),
      cursor = _require.cursor,
      erase = _require.erase;

const _require2 = __nccwpck_require__(8091),
      style = _require2.style,
      figures = _require2.figures,
      clear = _require2.clear,
      lines = _require2.lines;

const isNumber = /[0-9]/;

const isDef = any => any !== undefined;

const round = (number, precision) => {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};
/**
 * NumberPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {String} [opts.style='default'] Render style
 * @param {Number} [opts.initial] Default value
 * @param {Number} [opts.max=+Infinity] Max value
 * @param {Number} [opts.min=-Infinity] Min value
 * @param {Boolean} [opts.float=false] Parse input as floats
 * @param {Number} [opts.round=2] Round floats to x decimals
 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
 * @param {Function} [opts.validate] Validate function
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.error] The invalid error label
 */


class NumberPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.transform = style.render(opts.style);
    this.msg = opts.message;
    this.initial = isDef(opts.initial) ? opts.initial : '';
    this.float = !!opts.float;
    this.round = opts.round || 2;
    this.inc = opts.increment || 1;
    this.min = isDef(opts.min) ? opts.min : -Infinity;
    this.max = isDef(opts.max) ? opts.max : Infinity;
    this.errorMsg = opts.error || `Please Enter A Valid Value`;

    this.validator = opts.validate || (() => true);

    this.color = `cyan`;
    this.value = ``;
    this.typed = ``;
    this.lastHit = 0;
    this.render();
  }

  set value(v) {
    if (!v && v !== 0) {
      this.placeholder = true;
      this.rendered = color.gray(this.transform.render(`${this.initial}`));
      this._value = ``;
    } else {
      this.placeholder = false;
      this.rendered = this.transform.render(`${round(v, this.round)}`);
      this._value = round(v, this.round);
    }

    this.fire();
  }

  get value() {
    return this._value;
  }

  parse(x) {
    return this.float ? parseFloat(x) : parseInt(x);
  }

  valid(c) {
    return c === `-` || c === `.` && this.float || isNumber.test(c);
  }

  reset() {
    this.typed = ``;
    this.value = ``;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    let x = this.value;
    this.value = x !== `` ? x : this.initial;
    this.done = this.aborted = true;
    this.error = false;
    this.fire();
    this.render();
    this.out.write(`\n`);
    this.close();
  }

  validate() {
    var _this = this;

    return _asyncToGenerator(function* () {
      let valid = yield _this.validator(_this.value);

      if (typeof valid === `string`) {
        _this.errorMsg = valid;
        valid = false;
      }

      _this.error = !valid;
    })();
  }

  submit() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.validate();

      if (_this2.error) {
        _this2.color = `red`;

        _this2.fire();

        _this2.render();

        return;
      }

      let x = _this2.value;
      _this2.value = x !== `` ? x : _this2.initial;
      _this2.done = true;
      _this2.aborted = false;
      _this2.error = false;

      _this2.fire();

      _this2.render();

      _this2.out.write(`\n`);

      _this2.close();
    })();
  }

  up() {
    this.typed = ``;

    if (this.value === '') {
      this.value = this.min - this.inc;
    }

    if (this.value >= this.max) return this.bell();
    this.value += this.inc;
    this.color = `cyan`;
    this.fire();
    this.render();
  }

  down() {
    this.typed = ``;

    if (this.value === '') {
      this.value = this.min + this.inc;
    }

    if (this.value <= this.min) return this.bell();
    this.value -= this.inc;
    this.color = `cyan`;
    this.fire();
    this.render();
  }

  delete() {
    let val = this.value.toString();
    if (val.length === 0) return this.bell();
    this.value = this.parse(val = val.slice(0, -1)) || ``;

    if (this.value !== '' && this.value < this.min) {
      this.value = this.min;
    }

    this.color = `cyan`;
    this.fire();
    this.render();
  }

  next() {
    this.value = this.initial;
    this.fire();
    this.render();
  }

  _(c, key) {
    if (!this.valid(c)) return this.bell();
    const now = Date.now();
    if (now - this.lastHit > 1000) this.typed = ``; // 1s elapsed

    this.typed += c;
    this.lastHit = now;
    this.color = `cyan`;
    if (c === `.`) return this.fire();
    this.value = Math.min(this.parse(this.typed), this.max);
    if (this.value > this.max) this.value = this.max;
    if (this.value < this.min) this.value = this.min;
    this.fire();
    this.render();
  }

  render() {
    if (this.closed) return;

    if (!this.firstRender) {
      if (this.outputError) this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
      this.out.write(clear(this.outputText, this.out.columns));
    }

    super.render();
    this.outputError = ''; // Print prompt

    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), !this.done || !this.done && !this.placeholder ? color[this.color]().underline(this.rendered) : this.rendered].join(` `); // Print error

    if (this.error) {
      this.outputError += this.errorMsg.split(`\n`).reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore);
  }

}

module.exports = NumberPrompt;

/***/ }),

/***/ 461:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const readline = __nccwpck_require__(4521);

const _require = __nccwpck_require__(8091),
      action = _require.action;

const EventEmitter = __nccwpck_require__(2361);

const _require2 = __nccwpck_require__(9571),
      beep = _require2.beep,
      cursor = _require2.cursor;

const color = __nccwpck_require__(5215);
/**
 * Base prompt skeleton
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */


class Prompt extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.firstRender = true;
    this.in = opts.stdin || process.stdin;
    this.out = opts.stdout || process.stdout;

    this.onRender = (opts.onRender || (() => void 0)).bind(this);

    const rl = readline.createInterface({
      input: this.in,
      escapeCodeTimeout: 50
    });
    readline.emitKeypressEvents(this.in, rl);
    if (this.in.isTTY) this.in.setRawMode(true);
    const isSelect = ['SelectPrompt', 'MultiselectPrompt'].indexOf(this.constructor.name) > -1;

    const keypress = (str, key) => {
      let a = action(key, isSelect);

      if (a === false) {
        this._ && this._(str, key);
      } else if (typeof this[a] === 'function') {
        this[a](key);
      } else {
        this.bell();
      }
    };

    this.close = () => {
      this.out.write(cursor.show);
      this.in.removeListener('keypress', keypress);
      if (this.in.isTTY) this.in.setRawMode(false);
      rl.close();
      this.emit(this.aborted ? 'abort' : this.exited ? 'exit' : 'submit', this.value);
      this.closed = true;
    };

    this.in.on('keypress', keypress);
  }

  fire() {
    this.emit('state', {
      value: this.value,
      aborted: !!this.aborted,
      exited: !!this.exited
    });
  }

  bell() {
    this.out.write(beep);
  }

  render() {
    this.onRender(color);
    if (this.firstRender) this.firstRender = false;
  }

}

module.exports = Prompt;

/***/ }),

/***/ 8614:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);

const Prompt = __nccwpck_require__(461);

const _require = __nccwpck_require__(8091),
      style = _require.style,
      clear = _require.clear,
      figures = _require.figures,
      wrap = _require.wrap,
      entriesToDisplay = _require.entriesToDisplay;

const _require2 = __nccwpck_require__(9571),
      cursor = _require2.cursor;
/**
 * SelectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {Number} [opts.initial] Index of default value
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
 */


class SelectPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.hint = opts.hint || '- Use arrow-keys. Return to submit.';
    this.warn = opts.warn || '- This option is disabled';
    this.cursor = opts.initial || 0;
    this.choices = opts.choices.map((ch, idx) => {
      if (typeof ch === 'string') ch = {
        title: ch,
        value: idx
      };
      return {
        title: ch && (ch.title || ch.value || ch),
        value: ch && (ch.value === undefined ? idx : ch.value),
        description: ch && ch.description,
        selected: ch && ch.selected,
        disabled: ch && ch.disabled
      };
    });
    this.optionsPerPage = opts.optionsPerPage || 10;
    this.value = (this.choices[this.cursor] || {}).value;
    this.clear = clear('', this.out.columns);
    this.render();
  }

  moveCursor(n) {
    this.cursor = n;
    this.value = this.choices[n].value;
    this.fire();
  }

  reset() {
    this.moveCursor(0);
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    if (!this.selection.disabled) {
      this.done = true;
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write('\n');
      this.close();
    } else this.bell();
  }

  first() {
    this.moveCursor(0);
    this.render();
  }

  last() {
    this.moveCursor(this.choices.length - 1);
    this.render();
  }

  up() {
    if (this.cursor === 0) {
      this.moveCursor(this.choices.length - 1);
    } else {
      this.moveCursor(this.cursor - 1);
    }

    this.render();
  }

  down() {
    if (this.cursor === this.choices.length - 1) {
      this.moveCursor(0);
    } else {
      this.moveCursor(this.cursor + 1);
    }

    this.render();
  }

  next() {
    this.moveCursor((this.cursor + 1) % this.choices.length);
    this.render();
  }

  _(c, key) {
    if (c === ' ') return this.submit();
  }

  get selection() {
    return this.choices[this.cursor];
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
    super.render();

    let _entriesToDisplay = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage),
        startIndex = _entriesToDisplay.startIndex,
        endIndex = _entriesToDisplay.endIndex; // Print prompt


    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(false), this.done ? this.selection.title : this.selection.disabled ? color.yellow(this.warn) : color.gray(this.hint)].join(' '); // Print choices

    if (!this.done) {
      this.outputText += '\n';

      for (let i = startIndex; i < endIndex; i++) {
        let title,
            prefix,
            desc = '',
            v = this.choices[i]; // Determine whether to display "more choices" indicators

        if (i === startIndex && startIndex > 0) {
          prefix = figures.arrowUp;
        } else if (i === endIndex - 1 && endIndex < this.choices.length) {
          prefix = figures.arrowDown;
        } else {
          prefix = ' ';
        }

        if (v.disabled) {
          title = this.cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
          prefix = (this.cursor === i ? color.bold().gray(figures.pointer) + ' ' : '  ') + prefix;
        } else {
          title = this.cursor === i ? color.cyan().underline(v.title) : v.title;
          prefix = (this.cursor === i ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;

          if (v.description && this.cursor === i) {
            desc = ` - ${v.description}`;

            if (prefix.length + title.length + desc.length >= this.out.columns || v.description.split(/\r?\n/).length > 1) {
              desc = '\n' + wrap(v.description, {
                margin: 3,
                width: this.out.columns
              });
            }
          }
        }

        this.outputText += `${prefix} ${title}${color.gray(desc)}\n`;
      }
    }

    this.out.write(this.outputText);
  }

}

module.exports = SelectPrompt;

/***/ }),

/***/ 16:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const color = __nccwpck_require__(5215);

const Prompt = __nccwpck_require__(461);

const _require = __nccwpck_require__(9571),
      erase = _require.erase,
      cursor = _require.cursor;

const _require2 = __nccwpck_require__(8091),
      style = _require2.style,
      clear = _require2.clear,
      lines = _require2.lines,
      figures = _require2.figures;
/**
 * TextPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {String} [opts.style='default'] Render style
 * @param {String} [opts.initial] Default value
 * @param {Function} [opts.validate] Validate function
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.error] The invalid error label
 */


class TextPrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.transform = style.render(opts.style);
    this.scale = this.transform.scale;
    this.msg = opts.message;
    this.initial = opts.initial || ``;

    this.validator = opts.validate || (() => true);

    this.value = ``;
    this.errorMsg = opts.error || `Please Enter A Valid Value`;
    this.cursor = Number(!!this.initial);
    this.cursorOffset = 0;
    this.clear = clear(``, this.out.columns);
    this.render();
  }

  set value(v) {
    if (!v && this.initial) {
      this.placeholder = true;
      this.rendered = color.gray(this.transform.render(this.initial));
    } else {
      this.placeholder = false;
      this.rendered = this.transform.render(v);
    }

    this._value = v;
    this.fire();
  }

  get value() {
    return this._value;
  }

  reset() {
    this.value = ``;
    this.cursor = Number(!!this.initial);
    this.cursorOffset = 0;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.value = this.value || this.initial;
    this.done = this.aborted = true;
    this.error = false;
    this.red = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  validate() {
    var _this = this;

    return _asyncToGenerator(function* () {
      let valid = yield _this.validator(_this.value);

      if (typeof valid === `string`) {
        _this.errorMsg = valid;
        valid = false;
      }

      _this.error = !valid;
    })();
  }

  submit() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2.value = _this2.value || _this2.initial;
      _this2.cursorOffset = 0;
      _this2.cursor = _this2.rendered.length;
      yield _this2.validate();

      if (_this2.error) {
        _this2.red = true;

        _this2.fire();

        _this2.render();

        return;
      }

      _this2.done = true;
      _this2.aborted = false;

      _this2.fire();

      _this2.render();

      _this2.out.write('\n');

      _this2.close();
    })();
  }

  next() {
    if (!this.placeholder) return this.bell();
    this.value = this.initial;
    this.cursor = this.rendered.length;
    this.fire();
    this.render();
  }

  moveCursor(n) {
    if (this.placeholder) return;
    this.cursor = this.cursor + n;
    this.cursorOffset += n;
  }

  _(c, key) {
    let s1 = this.value.slice(0, this.cursor);
    let s2 = this.value.slice(this.cursor);
    this.value = `${s1}${c}${s2}`;
    this.red = false;
    this.cursor = this.placeholder ? 0 : s1.length + 1;
    this.render();
  }

  delete() {
    if (this.isCursorAtStart()) return this.bell();
    let s1 = this.value.slice(0, this.cursor - 1);
    let s2 = this.value.slice(this.cursor);
    this.value = `${s1}${s2}`;
    this.red = false;

    if (this.isCursorAtStart()) {
      this.cursorOffset = 0;
    } else {
      this.cursorOffset++;
      this.moveCursor(-1);
    }

    this.render();
  }

  deleteForward() {
    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) return this.bell();
    let s1 = this.value.slice(0, this.cursor);
    let s2 = this.value.slice(this.cursor + 1);
    this.value = `${s1}${s2}`;
    this.red = false;

    if (this.isCursorAtEnd()) {
      this.cursorOffset = 0;
    } else {
      this.cursorOffset++;
    }

    this.render();
  }

  first() {
    this.cursor = 0;
    this.render();
  }

  last() {
    this.cursor = this.value.length;
    this.render();
  }

  left() {
    if (this.cursor <= 0 || this.placeholder) return this.bell();
    this.moveCursor(-1);
    this.render();
  }

  right() {
    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) return this.bell();
    this.moveCursor(1);
    this.render();
  }

  isCursorAtStart() {
    return this.cursor === 0 || this.placeholder && this.cursor === 1;
  }

  isCursorAtEnd() {
    return this.cursor === this.rendered.length || this.placeholder && this.cursor === this.rendered.length + 1;
  }

  render() {
    if (this.closed) return;

    if (!this.firstRender) {
      if (this.outputError) this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
      this.out.write(clear(this.outputText, this.out.columns));
    }

    super.render();
    this.outputError = '';
    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.red ? color.red(this.rendered) : this.rendered].join(` `);

    if (this.error) {
      this.outputError += this.errorMsg.split(`\n`).reduce((a, l, i) => a + `\n${i ? ' ' : figures.pointerSmall} ${color.red().italic(l)}`, ``);
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore + cursor.move(this.cursorOffset, 0));
  }

}

module.exports = TextPrompt;

/***/ }),

/***/ 8001:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);

const Prompt = __nccwpck_require__(461);

const _require = __nccwpck_require__(8091),
      style = _require.style,
      clear = _require.clear;

const _require2 = __nccwpck_require__(9571),
      cursor = _require2.cursor,
      erase = _require2.erase;
/**
 * TogglePrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Boolean} [opts.initial=false] Default value
 * @param {String} [opts.active='no'] Active label
 * @param {String} [opts.inactive='off'] Inactive label
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */


class TogglePrompt extends Prompt {
  constructor(opts = {}) {
    super(opts);
    this.msg = opts.message;
    this.value = !!opts.initial;
    this.active = opts.active || 'on';
    this.inactive = opts.inactive || 'off';
    this.initialValue = this.value;
    this.render();
  }

  reset() {
    this.value = this.initialValue;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  deactivate() {
    if (this.value === false) return this.bell();
    this.value = false;
    this.render();
  }

  activate() {
    if (this.value === true) return this.bell();
    this.value = true;
    this.render();
  }

  delete() {
    this.deactivate();
  }

  left() {
    this.deactivate();
  }

  right() {
    this.activate();
  }

  down() {
    this.deactivate();
  }

  up() {
    this.activate();
  }

  next() {
    this.value = !this.value;
    this.fire();
    this.render();
  }

  _(c, key) {
    if (c === ' ') {
      this.value = !this.value;
    } else if (c === '1') {
      this.value = true;
    } else if (c === '0') {
      this.value = false;
    } else return this.bell();

    this.render();
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);else this.out.write(clear(this.outputText, this.out.columns));
    super.render();
    this.outputText = [style.symbol(this.done, this.aborted), color.bold(this.msg), style.delimiter(this.done), this.value ? this.inactive : color.cyan().underline(this.inactive), color.gray('/'), this.value ? color.cyan().underline(this.active) : this.active].join(' ');
    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }

}

module.exports = TogglePrompt;

/***/ }),

/***/ 5357:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const prompts = __nccwpck_require__(7627);

const passOn = ['suggest', 'format', 'onState', 'validate', 'onRender', 'type'];

const noop = () => {};
/**
 * Prompt for a series of questions
 * @param {Array|Object} questions Single question object or Array of question objects
 * @param {Function} [onSubmit] Callback function called on prompt submit
 * @param {Function} [onCancel] Callback function called on cancel/abort
 * @returns {Object} Object with values from user input
 */


function prompt() {
  return _prompt.apply(this, arguments);
}

function _prompt() {
  _prompt = _asyncToGenerator(function* (questions = [], {
    onSubmit = noop,
    onCancel = noop
  } = {}) {
    const answers = {};
    const override = prompt._override || {};
    questions = [].concat(questions);
    let answer, question, quit, name, type, lastPrompt;

    const getFormattedAnswer = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (question, answer, skipValidation = false) {
        if (!skipValidation && question.validate && question.validate(answer) !== true) {
          return;
        }

        return question.format ? yield question.format(answer, answers) : answer;
      });

      return function getFormattedAnswer(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }();

    var _iterator = _createForOfIteratorHelper(questions),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        question = _step.value;
        var _question = question;
        name = _question.name;
        type = _question.type;

        // evaluate type first and skip if type is a falsy value
        if (typeof type === 'function') {
          type = yield type(answer, _objectSpread({}, answers), question);
          question['type'] = type;
        }

        if (!type) continue; // if property is a function, invoke it unless it's a special function

        for (let key in question) {
          if (passOn.includes(key)) continue;
          let value = question[key];
          question[key] = typeof value === 'function' ? yield value(answer, _objectSpread({}, answers), lastPrompt) : value;
        }

        lastPrompt = question;

        if (typeof question.message !== 'string') {
          throw new Error('prompt message is required');
        } // update vars in case they changed


        var _question2 = question;
        name = _question2.name;
        type = _question2.type;

        if (prompts[type] === void 0) {
          throw new Error(`prompt type (${type}) is not defined`);
        }

        if (override[question.name] !== undefined) {
          answer = yield getFormattedAnswer(question, override[question.name]);

          if (answer !== undefined) {
            answers[name] = answer;
            continue;
          }
        }

        try {
          // Get the injected answer if there is one or prompt the user
          answer = prompt._injected ? getInjectedAnswer(prompt._injected, question.initial) : yield prompts[type](question);
          answers[name] = answer = yield getFormattedAnswer(question, answer, true);
          quit = yield onSubmit(question, answer, answers);
        } catch (err) {
          quit = !(yield onCancel(question, answers));
        }

        if (quit) return answers;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return answers;
  });
  return _prompt.apply(this, arguments);
}

function getInjectedAnswer(injected, deafultValue) {
  const answer = injected.shift();

  if (answer instanceof Error) {
    throw answer;
  }

  return answer === undefined ? deafultValue : answer;
}

function inject(answers) {
  prompt._injected = (prompt._injected || []).concat(answers);
}

function override(answers) {
  prompt._override = Object.assign({}, answers);
}

module.exports = Object.assign(prompt, {
  prompt,
  prompts,
  inject,
  override
});

/***/ }),

/***/ 7627:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



const $ = exports;

const el = __nccwpck_require__(2838);

const noop = v => v;

function toPrompt(type, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = new el[type](args);
    const onAbort = opts.onAbort || noop;
    const onSubmit = opts.onSubmit || noop;
    const onExit = opts.onExit || noop;
    p.on('state', args.onState || noop);
    p.on('submit', x => res(onSubmit(x)));
    p.on('exit', x => res(onExit(x)));
    p.on('abort', x => rej(onAbort(x)));
  });
}
/**
 * Text prompt
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {function} [args.onState] On state change callback
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.text = args => toPrompt('TextPrompt', args);
/**
 * Password prompt with masked input
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {function} [args.onState] On state change callback
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.password = args => {
  args.style = 'password';
  return $.text(args);
};
/**
 * Prompt where input is invisible, like sudo
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {function} [args.onState] On state change callback
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.invisible = args => {
  args.style = 'invisible';
  return $.text(args);
};
/**
 * Number prompt
 * @param {string} args.message Prompt message to display
 * @param {number} args.initial Default number value
 * @param {function} [args.onState] On state change callback
 * @param {number} [args.max] Max value
 * @param {number} [args.min] Min value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {Boolean} [opts.float=false] Parse input as floats
 * @param {Number} [opts.round=2] Round floats to x decimals
 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.number = args => toPrompt('NumberPrompt', args);
/**
 * Date prompt
 * @param {string} args.message Prompt message to display
 * @param {number} args.initial Default number value
 * @param {function} [args.onState] On state change callback
 * @param {number} [args.max] Max value
 * @param {number} [args.min] Min value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {Boolean} [opts.float=false] Parse input as floats
 * @param {Number} [opts.round=2] Round floats to x decimals
 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.date = args => toPrompt('DatePrompt', args);
/**
 * Classic yes/no prompt
 * @param {string} args.message Prompt message to display
 * @param {boolean} [args.initial=false] Default value
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.confirm = args => toPrompt('ConfirmPrompt', args);
/**
 * List prompt, split intput string by `seperator`
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {string} [args.separator] String separator
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input, in form of an `Array`
 */


$.list = args => {
  const sep = args.separator || ',';
  return toPrompt('TextPrompt', args, {
    onSubmit: str => str.split(sep).map(s => s.trim())
  });
};
/**
 * Toggle/switch prompt
 * @param {string} args.message Prompt message to display
 * @param {boolean} [args.initial=false] Default value
 * @param {string} [args.active="on"] Text for `active` state
 * @param {string} [args.inactive="off"] Text for `inactive` state
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.toggle = args => toPrompt('TogglePrompt', args);
/**
 * Interactive select prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
 * @param {number} [args.initial] Index of default value
 * @param {String} [args.hint] Hint to display
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.select = args => toPrompt('SelectPrompt', args);
/**
 * Interactive multi-select / autocompleteMultiselect prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
 * @param {number} [args.max] Max select
 * @param {string} [args.hint] Hint to display user
 * @param {Number} [args.cursor=0] Cursor start position
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.multiselect = args => {
  args.choices = [].concat(args.choices || []);

  const toSelected = items => items.filter(item => item.selected).map(item => item.value);

  return toPrompt('MultiselectPrompt', args, {
    onAbort: toSelected,
    onSubmit: toSelected
  });
};

$.autocompleteMultiselect = args => {
  args.choices = [].concat(args.choices || []);

  const toSelected = items => items.filter(item => item.selected).map(item => item.value);

  return toPrompt('AutocompleteMultiselectPrompt', args, {
    onAbort: toSelected,
    onSubmit: toSelected
  });
};

const byTitle = (input, choices) => Promise.resolve(choices.filter(item => item.title.slice(0, input.length).toLowerCase() === input.toLowerCase()));
/**
 * Interactive auto-complete prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of auto-complete choices objects `[{ title, value }, ...]`
 * @param {Function} [args.suggest] Function to filter results based on user input. Defaults to sort by `title`
 * @param {number} [args.limit=10] Max number of results to show
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {String} [args.initial] Index of the default value
 * @param {boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
 * @param {String} [args.fallback] Fallback message - defaults to initial value
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */


$.autocomplete = args => {
  args.suggest = args.suggest || byTitle;
  args.choices = [].concat(args.choices || []);
  return toPrompt('AutocompletePrompt', args);
};

/***/ }),

/***/ 9001:
/***/ ((module) => {



module.exports = (key, isSelect) => {
  if (key.meta && key.name !== 'escape') return;

  if (key.ctrl) {
    if (key.name === 'a') return 'first';
    if (key.name === 'c') return 'abort';
    if (key.name === 'd') return 'abort';
    if (key.name === 'e') return 'last';
    if (key.name === 'g') return 'reset';
  }

  if (isSelect) {
    if (key.name === 'j') return 'down';
    if (key.name === 'k') return 'up';
  }

  if (key.name === 'return') return 'submit';
  if (key.name === 'enter') return 'submit'; // ctrl + J

  if (key.name === 'backspace') return 'delete';
  if (key.name === 'delete') return 'deleteForward';
  if (key.name === 'abort') return 'abort';
  if (key.name === 'escape') return 'exit';
  if (key.name === 'tab') return 'next';
  if (key.name === 'pagedown') return 'nextPage';
  if (key.name === 'pageup') return 'prevPage'; // TODO create home() in prompt types (e.g. TextPrompt)

  if (key.name === 'home') return 'home'; // TODO create end() in prompt types (e.g. TextPrompt)

  if (key.name === 'end') return 'end';
  if (key.name === 'up') return 'up';
  if (key.name === 'down') return 'down';
  if (key.name === 'right') return 'right';
  if (key.name === 'left') return 'left';
  return false;
};

/***/ }),

/***/ 3952:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const strip = __nccwpck_require__(8007);

const _require = __nccwpck_require__(9571),
      erase = _require.erase,
      cursor = _require.cursor;

const width = str => [...strip(str)].length;
/**
 * @param {string} prompt
 * @param {number} perLine
 */


module.exports = function (prompt, perLine) {
  if (!perLine) return erase.line + cursor.to(0);
  let rows = 0;
  const lines = prompt.split(/\r?\n/);

  var _iterator = _createForOfIteratorHelper(lines),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      let line = _step.value;
      rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return erase.lines(rows);
};

/***/ }),

/***/ 4464:
/***/ ((module) => {


/**
 * Determine what entries should be displayed on the screen, based on the
 * currently selected index and the maximum visible. Used in list-based
 * prompts like `select` and `multiselect`.
 *
 * @param {number} cursor the currently selected entry
 * @param {number} total the total entries available to display
 * @param {number} [maxVisible] the number of entries that can be displayed
 */

module.exports = (cursor, total, maxVisible) => {
  maxVisible = maxVisible || total;
  let startIndex = Math.min(total - maxVisible, cursor - Math.floor(maxVisible / 2));
  if (startIndex < 0) startIndex = 0;
  let endIndex = Math.min(startIndex + maxVisible, total);
  return {
    startIndex,
    endIndex
  };
};

/***/ }),

/***/ 8845:
/***/ ((module) => {



const main = {
  arrowUp: '↑',
  arrowDown: '↓',
  arrowLeft: '←',
  arrowRight: '→',
  radioOn: '◉',
  radioOff: '◯',
  tick: '✔',
  cross: '✖',
  ellipsis: '…',
  pointerSmall: '›',
  line: '─',
  pointer: '❯'
};
const win = {
  arrowUp: main.arrowUp,
  arrowDown: main.arrowDown,
  arrowLeft: main.arrowLeft,
  arrowRight: main.arrowRight,
  radioOn: '(*)',
  radioOff: '( )',
  tick: '√',
  cross: '×',
  ellipsis: '...',
  pointerSmall: '»',
  line: '─',
  pointer: '>'
};
const figures = process.platform === 'win32' ? win : main;
module.exports = figures;

/***/ }),

/***/ 8091:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



module.exports = {
  action: __nccwpck_require__(9001),
  clear: __nccwpck_require__(3952),
  style: __nccwpck_require__(8295),
  strip: __nccwpck_require__(8007),
  figures: __nccwpck_require__(8845),
  lines: __nccwpck_require__(3802),
  wrap: __nccwpck_require__(1288),
  entriesToDisplay: __nccwpck_require__(4464)
};

/***/ }),

/***/ 3802:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const strip = __nccwpck_require__(8007);
/**
 * @param {string} msg
 * @param {number} perLine
 */


module.exports = function (msg, perLine) {
  let lines = String(strip(msg) || '').split(/\r?\n/);
  if (!perLine) return lines.length;
  return lines.map(l => Math.ceil(l.length / perLine)).reduce((a, b) => a + b);
};

/***/ }),

/***/ 8007:
/***/ ((module) => {



module.exports = str => {
  const pattern = ['[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)', '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'].join('|');
  const RGX = new RegExp(pattern, 'g');
  return typeof str === 'string' ? str.replace(RGX, '') : str;
};

/***/ }),

/***/ 8295:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const c = __nccwpck_require__(5215);

const figures = __nccwpck_require__(8845); // rendering user input.


const styles = Object.freeze({
  password: {
    scale: 1,
    render: input => '*'.repeat(input.length)
  },
  emoji: {
    scale: 2,
    render: input => '😃'.repeat(input.length)
  },
  invisible: {
    scale: 0,
    render: input => ''
  },
  default: {
    scale: 1,
    render: input => `${input}`
  }
});

const render = type => styles[type] || styles.default; // icon to signalize a prompt.


const symbols = Object.freeze({
  aborted: c.red(figures.cross),
  done: c.green(figures.tick),
  exited: c.yellow(figures.cross),
  default: c.cyan('?')
});

const symbol = (done, aborted, exited) => aborted ? symbols.aborted : exited ? symbols.exited : done ? symbols.done : symbols.default; // between the question and the user's input.


const delimiter = completing => c.gray(completing ? figures.ellipsis : figures.pointerSmall);

const item = (expandable, expanded) => c.gray(expandable ? expanded ? figures.pointerSmall : '+' : figures.line);

module.exports = {
  styles,
  render,
  symbols,
  symbol,
  delimiter,
  item
};

/***/ }),

/***/ 1288:
/***/ ((module) => {


/**
 * @param {string} msg The message to wrap
 * @param {object} opts
 * @param {number|string} [opts.margin] Left margin
 * @param {number} opts.width Maximum characters per line including the margin
 */

module.exports = (msg, opts = {}) => {
  const tab = Number.isSafeInteger(parseInt(opts.margin)) ? new Array(parseInt(opts.margin)).fill(' ').join('') : opts.margin || '';
  const width = opts.width;
  return (msg || '').split(/\r?\n/g).map(line => line.split(/\s+/g).reduce((arr, w) => {
    if (w.length + tab.length >= width || arr[arr.length - 1].length + w.length + 1 < width) arr[arr.length - 1] += ` ${w}`;else arr.push(`${tab}${w}`);
    return arr;
  }, [tab]).join('\n')).join('\n');
};

/***/ }),

/***/ 9646:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

function isNodeLT(tar) {
  tar = (Array.isArray(tar) ? tar : tar.split('.')).map(Number);
  let i=0, src=process.versions.node.split('.').map(Number);
  for (; i < tar.length; i++) {
    if (src[i] > tar[i]) return false;
    if (tar[i] > src[i]) return true;
  }
  return false;
}

module.exports =
  isNodeLT('8.6.0')
    ? __nccwpck_require__(5357)
    : __nccwpck_require__(5379);


/***/ }),

/***/ 8377:
/***/ ((module) => {



class DatePart {
  constructor({token, date, parts, locales}) {
    this.token = token;
    this.date = date || new Date();
    this.parts = parts || [this];
    this.locales = locales || {};
  }

  up() {}

  down() {}

  next() {
    const currentIdx = this.parts.indexOf(this);
    return this.parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
  }

  setTo(val) {}

  prev() {
    let parts = [].concat(this.parts).reverse();
    const currentIdx = parts.indexOf(this);
    return parts.find((part, idx) => idx > currentIdx && part instanceof DatePart);
  }

  toString() {
    return String(this.date);
  }
}

module.exports = DatePart;




/***/ }),

/***/ 6784:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

const pos = n => {
  n = n % 10;
  return n === 1 ? 'st'
       : n === 2 ? 'nd'
       : n === 3 ? 'rd'
       : 'th';
}

class Day extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setDate(this.date.getDate() + 1);
  }

  down() {
    this.date.setDate(this.date.getDate() - 1);
  }

  setTo(val) {
    this.date.setDate(parseInt(val.substr(-2)));
  }

  toString() {
    let date = this.date.getDate();
    let day = this.date.getDay();
    return this.token === 'DD' ? String(date).padStart(2, '0')
         : this.token === 'Do' ? date + pos(date)
         : this.token === 'd' ? day + 1
         : this.token === 'ddd' ? this.locales.weekdaysShort[day]
         : this.token === 'dddd' ? this.locales.weekdays[day]
         : date;
  }
}

module.exports = Day;


/***/ }),

/***/ 754:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

class Hours extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setHours(this.date.getHours() + 1);
  }

  down() {
    this.date.setHours(this.date.getHours() - 1);
  }

  setTo(val) {
    this.date.setHours(parseInt(val.substr(-2)));
  }

  toString() {
    let hours = this.date.getHours();
    if (/h/.test(this.token))
      hours = (hours % 12) || 12;
    return this.token.length > 1 ? String(hours).padStart(2, '0') : hours;
  }
}

module.exports = Hours;


/***/ }),

/***/ 8108:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



module.exports = {
  DatePart: __nccwpck_require__(8377),
  Meridiem: __nccwpck_require__(2616),
  Day: __nccwpck_require__(6784),
  Hours: __nccwpck_require__(754),
  Milliseconds: __nccwpck_require__(4316),
  Minutes: __nccwpck_require__(1770),
  Month: __nccwpck_require__(8086),
  Seconds: __nccwpck_require__(1823),
  Year: __nccwpck_require__(9208),
}


/***/ }),

/***/ 2616:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

class Meridiem extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setHours((this.date.getHours() + 12) % 24);
  }

  down() {
    this.up();
  }

  toString() {
    let meridiem = this.date.getHours() > 12 ? 'pm' : 'am';
    return /\A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
  }
}

module.exports = Meridiem;


/***/ }),

/***/ 4316:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

class Milliseconds extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
  }

  down() {
    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
  }

  setTo(val) {
    this.date.setMilliseconds(parseInt(val.substr(-(this.token.length))));
  }

  toString() {
    return String(this.date.getMilliseconds()).padStart(4, '0')
                                              .substr(0, this.token.length);
  }
}

module.exports = Milliseconds;


/***/ }),

/***/ 1770:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

class Minutes extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setMinutes(this.date.getMinutes() + 1);
  }

  down() {
    this.date.setMinutes(this.date.getMinutes() - 1);
  }

  setTo(val) {
    this.date.setMinutes(parseInt(val.substr(-2)));
  }

  toString() {
    let m = this.date.getMinutes();
    return this.token.length > 1 ? String(m).padStart(2, '0') : m;
  }
}

module.exports = Minutes;


/***/ }),

/***/ 8086:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

class Month extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setMonth(this.date.getMonth() + 1);
  }

  down() {
    this.date.setMonth(this.date.getMonth() - 1);
  }

  setTo(val) {
    val = parseInt(val.substr(-2)) - 1;
    this.date.setMonth(val < 0 ? 0 : val);
  }

  toString() {
    let month = this.date.getMonth();
    let tl = this.token.length;
    return tl === 2 ? String(month + 1).padStart(2, '0')
           : tl === 3 ? this.locales.monthsShort[month]
             : tl === 4 ? this.locales.months[month]
               : String(month + 1);
  }
}

module.exports = Month;


/***/ }),

/***/ 1823:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

class Seconds extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setSeconds(this.date.getSeconds() + 1);
  }

  down() {
    this.date.setSeconds(this.date.getSeconds() - 1);
  }

  setTo(val) {
    this.date.setSeconds(parseInt(val.substr(-2)));
  }

  toString() {
    let s = this.date.getSeconds();
    return this.token.length > 1 ? String(s).padStart(2, '0') : s;
  }
}

module.exports = Seconds;


/***/ }),

/***/ 9208:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const DatePart = __nccwpck_require__(8377);

class Year extends DatePart {
  constructor(opts={}) {
    super(opts);
  }

  up() {
    this.date.setFullYear(this.date.getFullYear() + 1);
  }

  down() {
    this.date.setFullYear(this.date.getFullYear() - 1);
  }

  setTo(val) {
    this.date.setFullYear(val.substr(-4));
  }

  toString() {
    let year = String(this.date.getFullYear()).padStart(4, '0');
    return this.token.length === 2 ? year.substr(-2) : year;
  }
}

module.exports = Year;


/***/ }),

/***/ 1098:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);
const Prompt = __nccwpck_require__(4185);
const { erase, cursor } = __nccwpck_require__(9571);
const { style, clear, figures, wrap, entriesToDisplay } = __nccwpck_require__(9501);

const getVal = (arr, i) => arr[i] && (arr[i].value || arr[i].title || arr[i]);
const getTitle = (arr, i) => arr[i] && (arr[i].title || arr[i].value || arr[i]);
const getIndex = (arr, valOrTitle) => {
  const index = arr.findIndex(el => el.value === valOrTitle || el.title === valOrTitle);
  return index > -1 ? index : undefined;
};

/**
 * TextPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of auto-complete choices objects
 * @param {Function} [opts.suggest] Filter function. Defaults to sort by title
 * @param {Number} [opts.limit=10] Max number of results to show
 * @param {Number} [opts.cursor=0] Cursor start position
 * @param {String} [opts.style='default'] Render style
 * @param {String} [opts.fallback] Fallback message - initial to default value
 * @param {String} [opts.initial] Index of the default value
 * @param {Boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.noMatches] The no matches found label
 */
class AutocompletePrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.msg = opts.message;
    this.suggest = opts.suggest;
    this.choices = opts.choices;
    this.initial = typeof opts.initial === 'number'
      ? opts.initial
      : getIndex(opts.choices, opts.initial);
    this.select = this.initial || opts.cursor || 0;
    this.i18n = { noMatches: opts.noMatches || 'no matches found' };
    this.fallback = opts.fallback || this.initial;
    this.clearFirst = opts.clearFirst || false;
    this.suggestions = [];
    this.input = '';
    this.limit = opts.limit || 10;
    this.cursor = 0;
    this.transform = style.render(opts.style);
    this.scale = this.transform.scale;
    this.render = this.render.bind(this);
    this.complete = this.complete.bind(this);
    this.clear = clear('', this.out.columns);
    this.complete(this.render);
    this.render();
  }

  set fallback(fb) {
    this._fb = Number.isSafeInteger(parseInt(fb)) ? parseInt(fb) : fb;
  }

  get fallback() {
    let choice;
    if (typeof this._fb === 'number')
      choice = this.choices[this._fb];
    else if (typeof this._fb === 'string')
      choice = { title: this._fb };
    return choice || this._fb || { title: this.i18n.noMatches };
  }

  moveSelect(i) {
    this.select = i;
    if (this.suggestions.length > 0)
      this.value = getVal(this.suggestions, i);
    else this.value = this.fallback.value;
    this.fire();
  }

  async complete(cb) {
    const p = (this.completing = this.suggest(this.input, this.choices));
    const suggestions = await p;

    if (this.completing !== p) return;
    this.suggestions = suggestions
      .map((s, i, arr) => ({ title: getTitle(arr, i), value: getVal(arr, i), description: s.description }));
    this.completing = false;
    const l = Math.max(suggestions.length - 1, 0);
    this.moveSelect(Math.min(l, this.select));

    cb && cb();
  }

  reset() {
    this.input = '';
    this.complete(() => {
      this.moveSelect(this.initial !== void 0 ? this.initial : 0);
      this.render();
    });
    this.render();
  }

  exit() {
    if (this.clearFirst && this.input.length > 0) {
      this.reset();
    } else {
      this.done = this.exited = true; 
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write('\n');
      this.close();
    }
  }

  abort() {
    this.done = this.aborted = true;
    this.exited = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.done = true;
    this.aborted = this.exited = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  _(c, key) {
    let s1 = this.input.slice(0, this.cursor);
    let s2 = this.input.slice(this.cursor);
    this.input = `${s1}${c}${s2}`;
    this.cursor = s1.length+1;
    this.complete(this.render);
    this.render();
  }

  delete() {
    if (this.cursor === 0) return this.bell();
    let s1 = this.input.slice(0, this.cursor-1);
    let s2 = this.input.slice(this.cursor);
    this.input = `${s1}${s2}`;
    this.complete(this.render);
    this.cursor = this.cursor-1;
    this.render();
  }

  deleteForward() {
    if(this.cursor*this.scale >= this.rendered.length) return this.bell();
    let s1 = this.input.slice(0, this.cursor);
    let s2 = this.input.slice(this.cursor+1);
    this.input = `${s1}${s2}`;
    this.complete(this.render);
    this.render();
  }

  first() {
    this.moveSelect(0);
    this.render();
  }

  last() {
    this.moveSelect(this.suggestions.length - 1);
    this.render();
  }

  up() {
    if (this.select === 0) {
      this.moveSelect(this.suggestions.length - 1);
    } else {
      this.moveSelect(this.select - 1);
    }
    this.render();
  }

  down() {
    if (this.select === this.suggestions.length - 1) {
      this.moveSelect(0);
    } else {
      this.moveSelect(this.select + 1);
    }
    this.render();
  }

  next() {
    if (this.select === this.suggestions.length - 1) {
      this.moveSelect(0);
    } else this.moveSelect(this.select + 1);
    this.render();
  }

  nextPage() {
    this.moveSelect(Math.min(this.select + this.limit, this.suggestions.length - 1));
    this.render();
  }

  prevPage() {
    this.moveSelect(Math.max(this.select - this.limit, 0));
    this.render();
  }

  left() {
    if (this.cursor <= 0) return this.bell();
    this.cursor = this.cursor-1;
    this.render();
  }

  right() {
    if (this.cursor*this.scale >= this.rendered.length) return this.bell();
    this.cursor = this.cursor+1;
    this.render();
  }

  renderOption(v, hovered, isStart, isEnd) {
    let desc;
    let prefix = isStart ? figures.arrowUp : isEnd ? figures.arrowDown : ' ';
    let title = hovered ? color.cyan().underline(v.title) : v.title;
    prefix = (hovered ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;
    if (v.description) {
      desc = ` - ${v.description}`;
      if (prefix.length + title.length + desc.length >= this.out.columns
        || v.description.split(/\r?\n/).length > 1) {
        desc = '\n' + wrap(v.description, { margin: 3, width: this.out.columns })
      }
    }
    return prefix + ' ' + title + color.gray(desc || '');
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    else this.out.write(clear(this.outputText, this.out.columns));
    super.render();

    let { startIndex, endIndex } = entriesToDisplay(this.select, this.choices.length, this.limit);

    this.outputText = [
      style.symbol(this.done, this.aborted, this.exited),
      color.bold(this.msg),
      style.delimiter(this.completing),
      this.done && this.suggestions[this.select]
        ? this.suggestions[this.select].title
        : this.rendered = this.transform.render(this.input)
    ].join(' ');

    if (!this.done) {
      const suggestions = this.suggestions
        .slice(startIndex, endIndex)
        .map((item, i) =>  this.renderOption(item,
          this.select === i + startIndex,
          i === 0 && startIndex > 0,
          i + startIndex === endIndex - 1 && endIndex < this.choices.length))
        .join('\n');
      this.outputText += `\n` + (suggestions || color.gray(this.fallback.title));
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }
}

module.exports = AutocompletePrompt;


/***/ }),

/***/ 8178:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);
const { cursor } = __nccwpck_require__(9571);
const MultiselectPrompt = __nccwpck_require__(1944);
const { clear, style, figures } = __nccwpck_require__(9501);
/**
 * MultiselectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {String} [opts.warn] Hint shown for disabled choices
 * @param {Number} [opts.max] Max choices
 * @param {Number} [opts.cursor=0] Cursor start position
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */
class AutocompleteMultiselectPrompt extends MultiselectPrompt {
  constructor(opts={}) {
    opts.overrideRender = true;
    super(opts);
    this.inputValue = '';
    this.clear = clear('', this.out.columns);
    this.filteredOptions = this.value;
    this.render();
  }

  last() {
    this.cursor = this.filteredOptions.length - 1;
    this.render();
  }
  next() {
    this.cursor = (this.cursor + 1) % this.filteredOptions.length;
    this.render();
  }

  up() {
    if (this.cursor === 0) {
      this.cursor = this.filteredOptions.length - 1;
    } else {
      this.cursor--;
    }
    this.render();
  }

  down() {
    if (this.cursor === this.filteredOptions.length - 1) {
      this.cursor = 0;
    } else {
      this.cursor++;
    }
    this.render();
  }

  left() {
    this.filteredOptions[this.cursor].selected = false;
    this.render();
  }

  right() {
    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
    this.filteredOptions[this.cursor].selected = true;
    this.render();
  }

  delete() {
    if (this.inputValue.length) {
      this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1);
      this.updateFilteredOptions();
    }
  }

  updateFilteredOptions() {
    const currentHighlight = this.filteredOptions[this.cursor];
    this.filteredOptions = this.value
      .filter(v => {
        if (this.inputValue) {
          if (typeof v.title === 'string') {
            if (v.title.toLowerCase().includes(this.inputValue.toLowerCase())) {
              return true;
            }
          }
          if (typeof v.value === 'string') {
            if (v.value.toLowerCase().includes(this.inputValue.toLowerCase())) {
              return true;
            }
          }
          return false;
        }
        return true;
      });
    const newHighlightIndex = this.filteredOptions.findIndex(v => v === currentHighlight)
    this.cursor = newHighlightIndex < 0 ? 0 : newHighlightIndex;
    this.render();
  }

  handleSpaceToggle() {
    const v = this.filteredOptions[this.cursor];

    if (v.selected) {
      v.selected = false;
      this.render();
    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
      return this.bell();
    } else {
      v.selected = true;
      this.render();
    }
  }

  handleInputChange(c) {
    this.inputValue = this.inputValue + c;
    this.updateFilteredOptions();
  }

  _(c, key) {
    if (c === ' ') {
      this.handleSpaceToggle();
    } else {
      this.handleInputChange(c);
    }
  }

  renderInstructions() {
    if (this.instructions === undefined || this.instructions) {
      if (typeof this.instructions === 'string') {
        return this.instructions;
      }
      return `
Instructions:
    ${figures.arrowUp}/${figures.arrowDown}: Highlight option
    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection
    [a,b,c]/delete: Filter choices
    enter/return: Complete answer
`;
    }
    return '';
  }

  renderCurrentInput() {
    return `
Filtered results for: ${this.inputValue ? this.inputValue : color.gray('Enter something to filter')}\n`;
  }

  renderOption(cursor, v, i) {
    let title;
    if (v.disabled) title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
    else title = cursor === i ? color.cyan().underline(v.title) : v.title;
    return (v.selected ? color.green(figures.radioOn) : figures.radioOff) + '  ' + title
  }

  renderDoneOrInstructions() {
    if (this.done) {
      return this.value
        .filter(e => e.selected)
        .map(v => v.title)
        .join(', ');
    }

    const output = [color.gray(this.hint), this.renderInstructions(), this.renderCurrentInput()];

    if (this.filteredOptions.length && this.filteredOptions[this.cursor].disabled) {
      output.push(color.yellow(this.warn));
    }
    return output.join(' ');
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    super.render();

    // print prompt

    let prompt = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(false),
      this.renderDoneOrInstructions()
    ].join(' ');

    if (this.showMinError) {
      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
      this.showMinError = false;
    }
    prompt += this.renderOptions(this.filteredOptions);

    this.out.write(this.clear + prompt);
    this.clear = clear(prompt, this.out.columns);
  }
}

module.exports = AutocompleteMultiselectPrompt;


/***/ }),

/***/ 1491:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const color = __nccwpck_require__(5215);
const Prompt = __nccwpck_require__(4185);
const { style, clear } = __nccwpck_require__(9501);
const { erase, cursor } = __nccwpck_require__(9571);

/**
 * ConfirmPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Boolean} [opts.initial] Default value (true/false)
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.yes] The "Yes" label
 * @param {String} [opts.yesOption] The "Yes" option when choosing between yes/no
 * @param {String} [opts.no] The "No" label
 * @param {String} [opts.noOption] The "No" option when choosing between yes/no
 */
class ConfirmPrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.msg = opts.message;
    this.value = opts.initial;
    this.initialValue = !!opts.initial;
    this.yesMsg = opts.yes || 'yes';
    this.yesOption = opts.yesOption || '(Y/n)';
    this.noMsg = opts.no || 'no';
    this.noOption = opts.noOption || '(y/N)';
    this.render();
  }

  reset() {
    this.value = this.initialValue;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.value = this.value || false;
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  _(c, key) {
    if (c.toLowerCase() === 'y') {
      this.value = true;
      return this.submit();
    }
    if (c.toLowerCase() === 'n') {
      this.value = false;
      return this.submit();
    }
    return this.bell();
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    else this.out.write(clear(this.outputText, this.out.columns));
    super.render();

    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(this.done),
      this.done ? (this.value ? this.yesMsg : this.noMsg)
          : color.gray(this.initialValue ? this.yesOption : this.noOption)
    ].join(' ');

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }
}

module.exports = ConfirmPrompt;


/***/ }),

/***/ 5667:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);
const Prompt = __nccwpck_require__(4185);
const { style, clear, figures } = __nccwpck_require__(9501);
const { erase, cursor } = __nccwpck_require__(9571);
const { DatePart, Meridiem, Day, Hours, Milliseconds, Minutes, Month, Seconds, Year } = __nccwpck_require__(8108);

const regex = /\\(.)|"((?:\\["\\]|[^"])+)"|(D[Do]?|d{3,4}|d)|(M{1,4})|(YY(?:YY)?)|([aA])|([Hh]{1,2})|(m{1,2})|(s{1,2})|(S{1,4})|./g;
const regexGroups = {
  1: ({token}) => token.replace(/\\(.)/g, '$1'),
  2: (opts) => new Day(opts), // Day // TODO
  3: (opts) => new Month(opts), // Month
  4: (opts) => new Year(opts), // Year
  5: (opts) => new Meridiem(opts), // AM/PM // TODO (special)
  6: (opts) => new Hours(opts), // Hours
  7: (opts) => new Minutes(opts), // Minutes
  8: (opts) => new Seconds(opts), // Seconds
  9: (opts) => new Milliseconds(opts), // Fractional seconds
}

const dfltLocales = {
  months: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
  monthsShort: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
  weekdays: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
  weekdaysShort: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',')
}


/**
 * DatePrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Number} [opts.initial] Index of default value
 * @param {String} [opts.mask] The format mask
 * @param {object} [opts.locales] The date locales
 * @param {String} [opts.error] The error message shown on invalid value
 * @param {Function} [opts.validate] Function to validate the submitted value
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */
class DatePrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.msg = opts.message;
    this.cursor = 0;
    this.typed = '';
    this.locales = Object.assign(dfltLocales, opts.locales);
    this._date = opts.initial || new Date();
    this.errorMsg = opts.error || 'Please Enter A Valid Value';
    this.validator = opts.validate || (() => true);
    this.mask = opts.mask || 'YYYY-MM-DD HH:mm:ss';
    this.clear = clear('', this.out.columns);
    this.render();
  }

  get value() {
    return this.date
  }

  get date() {
    return this._date;
  }

  set date(date) {
    if (date) this._date.setTime(date.getTime());
  }

  set mask(mask) {
    let result;
    this.parts = [];
    while(result = regex.exec(mask)) {
      let match = result.shift();
      let idx = result.findIndex(gr => gr != null);
      this.parts.push(idx in regexGroups
        ? regexGroups[idx]({ token: result[idx] || match, date: this.date, parts: this.parts, locales: this.locales })
        : result[idx] || match);
    }

    let parts = this.parts.reduce((arr, i) => {
      if (typeof i === 'string' && typeof arr[arr.length - 1] === 'string')
        arr[arr.length - 1] += i;
      else arr.push(i);
      return arr;
    }, []);

    this.parts.splice(0);
    this.parts.push(...parts);
    this.reset();
  }

  moveCursor(n) {
    this.typed = '';
    this.cursor = n;
    this.fire();
  }

  reset() {
    this.moveCursor(this.parts.findIndex(p => p instanceof DatePart));
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.error = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  async validate() {
    let valid = await this.validator(this.value);
    if (typeof valid === 'string') {
      this.errorMsg = valid;
      valid = false;
    }
    this.error = !valid;
  }

  async submit() {
    await this.validate();
    if (this.error) {
      this.color = 'red';
      this.fire();
      this.render();
      return;
    }
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  up() {
    this.typed = '';
    this.parts[this.cursor].up();
    this.render();
  }

  down() {
    this.typed = '';
    this.parts[this.cursor].down();
    this.render();
  }

  left() {
    let prev = this.parts[this.cursor].prev();
    if (prev == null) return this.bell();
    this.moveCursor(this.parts.indexOf(prev));
    this.render();
  }

  right() {
    let next = this.parts[this.cursor].next();
    if (next == null) return this.bell();
    this.moveCursor(this.parts.indexOf(next));
    this.render();
  }

  next() {
    let next = this.parts[this.cursor].next();
    this.moveCursor(next
      ? this.parts.indexOf(next)
      : this.parts.findIndex((part) => part instanceof DatePart));
    this.render();
  }

  _(c) {
    if (/\d/.test(c)) {
      this.typed += c;
      this.parts[this.cursor].setTo(this.typed);
      this.render();
    }
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    else this.out.write(clear(this.outputText, this.out.columns));
    super.render();

    // Print prompt
    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(false),
      this.parts.reduce((arr, p, idx) => arr.concat(idx === this.cursor && !this.done ? color.cyan().underline(p.toString()) : p), [])
          .join('')
    ].join(' ');

    // Print error
    if (this.error) {
      this.outputText += this.errorMsg.split('\n').reduce(
          (a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }
}

module.exports = DatePrompt;


/***/ }),

/***/ 9098:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



module.exports = {
  TextPrompt: __nccwpck_require__(5387),
  SelectPrompt: __nccwpck_require__(6514),
  TogglePrompt: __nccwpck_require__(2093),
  DatePrompt: __nccwpck_require__(5667),
  NumberPrompt: __nccwpck_require__(2952),
  MultiselectPrompt: __nccwpck_require__(1944),
  AutocompletePrompt: __nccwpck_require__(1098),
  AutocompleteMultiselectPrompt: __nccwpck_require__(8178),
  ConfirmPrompt: __nccwpck_require__(1491)
};


/***/ }),

/***/ 1944:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);
const { cursor } = __nccwpck_require__(9571);
const Prompt = __nccwpck_require__(4185);
const { clear, figures, style, wrap, entriesToDisplay } = __nccwpck_require__(9501);

/**
 * MultiselectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {String} [opts.warn] Hint shown for disabled choices
 * @param {Number} [opts.max] Max choices
 * @param {Number} [opts.cursor=0] Cursor start position
 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */
class MultiselectPrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.msg = opts.message;
    this.cursor = opts.cursor || 0;
    this.scrollIndex = opts.cursor || 0;
    this.hint = opts.hint || '';
    this.warn = opts.warn || '- This option is disabled -';
    this.minSelected = opts.min;
    this.showMinError = false;
    this.maxChoices = opts.max;
    this.instructions = opts.instructions;
    this.optionsPerPage = opts.optionsPerPage || 10;
    this.value = opts.choices.map((ch, idx) => {
      if (typeof ch === 'string')
        ch = {title: ch, value: idx};
      return {
        title: ch && (ch.title || ch.value || ch),
        description: ch && ch.description,
        value: ch && (ch.value === undefined ? idx : ch.value),
        selected: ch && ch.selected,
        disabled: ch && ch.disabled
      };
    });
    this.clear = clear('', this.out.columns);
    if (!opts.overrideRender) {
      this.render();
    }
  }

  reset() {
    this.value.map(v => !v.selected);
    this.cursor = 0;
    this.fire();
    this.render();
  }

  selected() {
    return this.value.filter(v => v.selected);
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    const selected = this.value
      .filter(e => e.selected);
    if (this.minSelected && selected.length < this.minSelected) {
      this.showMinError = true;
      this.render();
    } else {
      this.done = true;
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write('\n');
      this.close();
    }
  }

  first() {
    this.cursor = 0;
    this.render();
  }

  last() {
    this.cursor = this.value.length - 1;
    this.render();
  }
  next() {
    this.cursor = (this.cursor + 1) % this.value.length;
    this.render();
  }

  up() {
    if (this.cursor === 0) {
      this.cursor = this.value.length - 1;
    } else {
      this.cursor--;
    }
    this.render();
  }

  down() {
    if (this.cursor === this.value.length - 1) {
      this.cursor = 0;
    } else {
      this.cursor++;
    }
    this.render();
  }

  left() {
    this.value[this.cursor].selected = false;
    this.render();
  }

  right() {
    if (this.value.filter(e => e.selected).length >= this.maxChoices) return this.bell();
    this.value[this.cursor].selected = true;
    this.render();
  }

  handleSpaceToggle() {
    const v = this.value[this.cursor];

    if (v.selected) {
      v.selected = false;
      this.render();
    } else if (v.disabled || this.value.filter(e => e.selected).length >= this.maxChoices) {
      return this.bell();
    } else {
      v.selected = true;
      this.render();
    }
  }

  toggleAll() {
    if (this.maxChoices !== undefined || this.value[this.cursor].disabled) {
      return this.bell();
    }

    const newSelected = !this.value[this.cursor].selected;
    this.value.filter(v => !v.disabled).forEach(v => v.selected = newSelected);
    this.render();
  }

  _(c, key) {
    if (c === ' ') {
      this.handleSpaceToggle();
    } else if (c === 'a') {
      this.toggleAll();
    } else {
      return this.bell();
    }
  }

  renderInstructions() {
    if (this.instructions === undefined || this.instructions) {
      if (typeof this.instructions === 'string') {
        return this.instructions;
      }
      return '\nInstructions:\n'
        + `    ${figures.arrowUp}/${figures.arrowDown}: Highlight option\n`
        + `    ${figures.arrowLeft}/${figures.arrowRight}/[space]: Toggle selection\n`
        + (this.maxChoices === undefined ? `    a: Toggle all\n` : '')
        + `    enter/return: Complete answer`;
    }
    return '';
  }

  renderOption(cursor, v, i, arrowIndicator) {
    const prefix = (v.selected ? color.green(figures.radioOn) : figures.radioOff) + ' ' + arrowIndicator + ' ';
    let title, desc;

    if (v.disabled) {
      title = cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
    } else {
      title = cursor === i ? color.cyan().underline(v.title) : v.title;
      if (cursor === i && v.description) {
        desc = ` - ${v.description}`;
        if (prefix.length + title.length + desc.length >= this.out.columns
          || v.description.split(/\r?\n/).length > 1) {
          desc = '\n' + wrap(v.description, { margin: prefix.length, width: this.out.columns });
        }
      }
    }

    return prefix + title + color.gray(desc || '');
  }

  // shared with autocompleteMultiselect
  paginateOptions(options) {
    if (options.length === 0) {
      return color.red('No matches for this query.');
    }

    let { startIndex, endIndex } = entriesToDisplay(this.cursor, options.length, this.optionsPerPage);
    let prefix, styledOptions = [];

    for (let i = startIndex; i < endIndex; i++) {
      if (i === startIndex && startIndex > 0) {
        prefix = figures.arrowUp;
      } else if (i === endIndex - 1 && endIndex < options.length) {
        prefix = figures.arrowDown;
      } else {
        prefix = ' ';
      }
      styledOptions.push(this.renderOption(this.cursor, options[i], i, prefix));
    }

    return '\n' + styledOptions.join('\n');
  }

  // shared with autocomleteMultiselect
  renderOptions(options) {
    if (!this.done) {
      return this.paginateOptions(options);
    }
    return '';
  }

  renderDoneOrInstructions() {
    if (this.done) {
      return this.value
        .filter(e => e.selected)
        .map(v => v.title)
        .join(', ');
    }

    const output = [color.gray(this.hint), this.renderInstructions()];

    if (this.value[this.cursor].disabled) {
      output.push(color.yellow(this.warn));
    }
    return output.join(' ');
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    super.render();

    // print prompt
    let prompt = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(false),
      this.renderDoneOrInstructions()
    ].join(' ');
    if (this.showMinError) {
      prompt += color.red(`You must select a minimum of ${this.minSelected} choices.`);
      this.showMinError = false;
    }
    prompt += this.renderOptions(this.value);

    this.out.write(this.clear + prompt);
    this.clear = clear(prompt, this.out.columns);
  }
}

module.exports = MultiselectPrompt;


/***/ }),

/***/ 2952:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const color = __nccwpck_require__(5215);
const Prompt = __nccwpck_require__(4185);
const { cursor, erase } = __nccwpck_require__(9571);
const { style, figures, clear, lines } = __nccwpck_require__(9501);

const isNumber = /[0-9]/;
const isDef = any => any !== undefined;
const round = (number, precision) => {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

/**
 * NumberPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {String} [opts.style='default'] Render style
 * @param {Number} [opts.initial] Default value
 * @param {Number} [opts.max=+Infinity] Max value
 * @param {Number} [opts.min=-Infinity] Min value
 * @param {Boolean} [opts.float=false] Parse input as floats
 * @param {Number} [opts.round=2] Round floats to x decimals
 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
 * @param {Function} [opts.validate] Validate function
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.error] The invalid error label
 */
class NumberPrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.transform = style.render(opts.style);
    this.msg = opts.message;
    this.initial = isDef(opts.initial) ? opts.initial : '';
    this.float = !!opts.float;
    this.round = opts.round || 2;
    this.inc = opts.increment || 1;
    this.min = isDef(opts.min) ? opts.min : -Infinity;
    this.max = isDef(opts.max) ? opts.max : Infinity;
    this.errorMsg = opts.error || `Please Enter A Valid Value`;
    this.validator = opts.validate || (() => true);
    this.color = `cyan`;
    this.value = ``;
    this.typed = ``;
    this.lastHit = 0;
    this.render();
  }

  set value(v) {
    if (!v && v !== 0) {
      this.placeholder = true;
      this.rendered = color.gray(this.transform.render(`${this.initial}`));
      this._value = ``;
    } else {
      this.placeholder = false;
      this.rendered = this.transform.render(`${round(v, this.round)}`);
      this._value = round(v, this.round);
    }
    this.fire();
  }

  get value() {
    return this._value;
  }

  parse(x) {
    return this.float ? parseFloat(x) : parseInt(x);
  }

  valid(c) {
    return c === `-` || c === `.` && this.float || isNumber.test(c)
  }

  reset() {
    this.typed = ``;
    this.value = ``;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    let x = this.value;
    this.value = x !== `` ? x : this.initial;
    this.done = this.aborted = true;
    this.error = false;
    this.fire();
    this.render();
    this.out.write(`\n`);
    this.close();
  }

  async validate() {
    let valid = await this.validator(this.value);
    if (typeof valid === `string`) {
      this.errorMsg = valid;
      valid = false;
    }
    this.error = !valid;
  }

  async submit() {
    await this.validate();
    if (this.error) {
      this.color = `red`;
      this.fire();
      this.render();
      return;
    }
    let x = this.value;
    this.value = x !== `` ? x : this.initial;
    this.done = true;
    this.aborted = false;
    this.error = false;
    this.fire();
    this.render();
    this.out.write(`\n`);
    this.close();
  }

  up() {
    this.typed = ``;
    if(this.value === '') {
      this.value = this.min - this.inc;
    }
    if (this.value >= this.max) return this.bell();
    this.value += this.inc;
    this.color = `cyan`;
    this.fire();
    this.render();
  }

  down() {
    this.typed = ``;
    if(this.value === '') {
      this.value = this.min + this.inc;
    }
    if (this.value <= this.min) return this.bell();
    this.value -= this.inc;
    this.color = `cyan`;
    this.fire();
    this.render();
  }

  delete() {
    let val = this.value.toString();
    if (val.length === 0) return this.bell();
    this.value = this.parse((val = val.slice(0, -1))) || ``;
    if (this.value !== '' && this.value < this.min) {
      this.value = this.min;
    }
    this.color = `cyan`;
    this.fire();
    this.render();
  }

  next() {
    this.value = this.initial;
    this.fire();
    this.render();
  }

  _(c, key) {
    if (!this.valid(c)) return this.bell();

    const now = Date.now();
    if (now - this.lastHit > 1000) this.typed = ``; // 1s elapsed
    this.typed += c;
    this.lastHit = now;
    this.color = `cyan`;

    if (c === `.`) return this.fire();

    this.value = Math.min(this.parse(this.typed), this.max);
    if (this.value > this.max) this.value = this.max;
    if (this.value < this.min) this.value = this.min;
    this.fire();
    this.render();
  }

  render() {
    if (this.closed) return;
    if (!this.firstRender) {
      if (this.outputError)
        this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
      this.out.write(clear(this.outputText, this.out.columns));
    }
    super.render();
    this.outputError = '';

    // Print prompt
    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(this.done),
      !this.done || (!this.done && !this.placeholder)
          ? color[this.color]().underline(this.rendered) : this.rendered
    ].join(` `);

    // Print error
    if (this.error) {
      this.outputError += this.errorMsg.split(`\n`)
          .reduce((a, l, i) => a + `\n${i ? ` ` : figures.pointerSmall} ${color.red().italic(l)}`, ``);
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore);
  }
}

module.exports = NumberPrompt;


/***/ }),

/***/ 4185:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const readline = __nccwpck_require__(4521);
const { action } = __nccwpck_require__(9501);
const EventEmitter = __nccwpck_require__(2361);
const { beep, cursor } = __nccwpck_require__(9571);
const color = __nccwpck_require__(5215);

/**
 * Base prompt skeleton
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */
class Prompt extends EventEmitter {
  constructor(opts={}) {
    super();

    this.firstRender = true;
    this.in = opts.stdin || process.stdin;
    this.out = opts.stdout || process.stdout;
    this.onRender = (opts.onRender || (() => void 0)).bind(this);
    const rl = readline.createInterface({ input:this.in, escapeCodeTimeout:50 });
    readline.emitKeypressEvents(this.in, rl);

    if (this.in.isTTY) this.in.setRawMode(true);
    const isSelect = [ 'SelectPrompt', 'MultiselectPrompt' ].indexOf(this.constructor.name) > -1;
    const keypress = (str, key) => {
      let a = action(key, isSelect);
      if (a === false) {
        this._ && this._(str, key);
      } else if (typeof this[a] === 'function') {
        this[a](key);
      } else {
        this.bell();
      }
    };

    this.close = () => {
      this.out.write(cursor.show);
      this.in.removeListener('keypress', keypress);
      if (this.in.isTTY) this.in.setRawMode(false);
      rl.close();
      this.emit(this.aborted ? 'abort' : this.exited ? 'exit' : 'submit', this.value);
      this.closed = true;
    };

    this.in.on('keypress', keypress);
  }

  fire() {
    this.emit('state', {
      value: this.value,
      aborted: !!this.aborted,
      exited: !!this.exited
    });
  }

  bell() {
    this.out.write(beep);
  }

  render() {
    this.onRender(color);
    if (this.firstRender) this.firstRender = false;
  }
}

module.exports = Prompt;


/***/ }),

/***/ 6514:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const color = __nccwpck_require__(5215);
const Prompt = __nccwpck_require__(4185);
const { style, clear, figures, wrap, entriesToDisplay } = __nccwpck_require__(9501);
const { cursor } = __nccwpck_require__(9571);

/**
 * SelectPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Array} opts.choices Array of choice objects
 * @param {String} [opts.hint] Hint to display
 * @param {Number} [opts.initial] Index of default value
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {Number} [opts.optionsPerPage=10] Max options to display at once
 */
class SelectPrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.msg = opts.message;
    this.hint = opts.hint || '- Use arrow-keys. Return to submit.';
    this.warn = opts.warn || '- This option is disabled';
    this.cursor = opts.initial || 0;
    this.choices = opts.choices.map((ch, idx) => {
      if (typeof ch === 'string')
        ch = {title: ch, value: idx};
      return {
        title: ch && (ch.title || ch.value || ch),
        value: ch && (ch.value === undefined ? idx : ch.value),
        description: ch && ch.description,
        selected: ch && ch.selected,
        disabled: ch && ch.disabled
      };
    });
    this.optionsPerPage = opts.optionsPerPage || 10;
    this.value = (this.choices[this.cursor] || {}).value;
    this.clear = clear('', this.out.columns);
    this.render();
  }

  moveCursor(n) {
    this.cursor = n;
    this.value = this.choices[n].value;
    this.fire();
  }

  reset() {
    this.moveCursor(0);
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    if (!this.selection.disabled) {
      this.done = true;
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write('\n');
      this.close();
    } else
      this.bell();
  }

  first() {
    this.moveCursor(0);
    this.render();
  }

  last() {
    this.moveCursor(this.choices.length - 1);
    this.render();
  }

  up() {
    if (this.cursor === 0) {
      this.moveCursor(this.choices.length - 1);
    } else {
      this.moveCursor(this.cursor - 1);
    }
    this.render();
  }

  down() {
    if (this.cursor === this.choices.length - 1) {
      this.moveCursor(0);
    } else {
      this.moveCursor(this.cursor + 1);
    }
    this.render();
  }

  next() {
    this.moveCursor((this.cursor + 1) % this.choices.length);
    this.render();
  }

  _(c, key) {
    if (c === ' ') return this.submit();
  }

  get selection() {
    return this.choices[this.cursor];
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    else this.out.write(clear(this.outputText, this.out.columns));
    super.render();

    let { startIndex, endIndex } = entriesToDisplay(this.cursor, this.choices.length, this.optionsPerPage);

    // Print prompt
    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(false),
      this.done ? this.selection.title : this.selection.disabled
          ? color.yellow(this.warn) : color.gray(this.hint)
    ].join(' ');

    // Print choices
    if (!this.done) {
      this.outputText += '\n';
      for (let i = startIndex; i < endIndex; i++) {
        let title, prefix, desc = '', v = this.choices[i];

        // Determine whether to display "more choices" indicators
        if (i === startIndex && startIndex > 0) {
          prefix = figures.arrowUp;
        } else if (i === endIndex - 1 && endIndex < this.choices.length) {
          prefix = figures.arrowDown;
        } else {
          prefix = ' ';
        }

        if (v.disabled) {
          title = this.cursor === i ? color.gray().underline(v.title) : color.strikethrough().gray(v.title);
          prefix = (this.cursor === i ? color.bold().gray(figures.pointer) + ' ' : '  ') + prefix;
        } else {
          title = this.cursor === i ? color.cyan().underline(v.title) : v.title;
          prefix = (this.cursor === i ? color.cyan(figures.pointer) + ' ' : '  ') + prefix;
          if (v.description && this.cursor === i) {
            desc = ` - ${v.description}`;
            if (prefix.length + title.length + desc.length >= this.out.columns
                || v.description.split(/\r?\n/).length > 1) {
              desc = '\n' + wrap(v.description, { margin: 3, width: this.out.columns });
            }
          }
        }

        this.outputText += `${prefix} ${title}${color.gray(desc)}\n`;
      }
    }

    this.out.write(this.outputText);
  }
}

module.exports = SelectPrompt;


/***/ }),

/***/ 5387:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const color = __nccwpck_require__(5215);
const Prompt = __nccwpck_require__(4185);
const { erase, cursor } = __nccwpck_require__(9571);
const { style, clear, lines, figures } = __nccwpck_require__(9501);

/**
 * TextPrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {String} [opts.style='default'] Render style
 * @param {String} [opts.initial] Default value
 * @param {Function} [opts.validate] Validate function
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 * @param {String} [opts.error] The invalid error label
 */
class TextPrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.transform = style.render(opts.style);
    this.scale = this.transform.scale;
    this.msg = opts.message;
    this.initial = opts.initial || ``;
    this.validator = opts.validate || (() => true);
    this.value = ``;
    this.errorMsg = opts.error || `Please Enter A Valid Value`;
    this.cursor = Number(!!this.initial);
    this.cursorOffset = 0;
    this.clear = clear(``, this.out.columns);
    this.render();
  }

  set value(v) {
    if (!v && this.initial) {
      this.placeholder = true;
      this.rendered = color.gray(this.transform.render(this.initial));
    } else {
      this.placeholder = false;
      this.rendered = this.transform.render(v);
    }
    this._value = v;
    this.fire();
  }

  get value() {
    return this._value;
  }

  reset() {
    this.value = ``;
    this.cursor = Number(!!this.initial);
    this.cursorOffset = 0;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.value = this.value || this.initial;
    this.done = this.aborted = true;
    this.error = false;
    this.red = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  async validate() {
    let valid = await this.validator(this.value);
    if (typeof valid === `string`) {
      this.errorMsg = valid;
      valid = false;
    }
    this.error = !valid;
  }

  async submit() {
    this.value = this.value || this.initial;
    this.cursorOffset = 0;
    this.cursor = this.rendered.length;
    await this.validate();
    if (this.error) {
      this.red = true;
      this.fire();
      this.render();
      return;
    }
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  next() {
    if (!this.placeholder) return this.bell();
    this.value = this.initial;
    this.cursor = this.rendered.length;
    this.fire();
    this.render();
  }

  moveCursor(n) {
    if (this.placeholder) return;
    this.cursor = this.cursor+n;
    this.cursorOffset += n;
  }

  _(c, key) {
    let s1 = this.value.slice(0, this.cursor);
    let s2 = this.value.slice(this.cursor);
    this.value = `${s1}${c}${s2}`;
    this.red = false;
    this.cursor = this.placeholder ? 0 : s1.length+1;
    this.render();
  }

  delete() {
    if (this.isCursorAtStart()) return this.bell();
    let s1 = this.value.slice(0, this.cursor-1);
    let s2 = this.value.slice(this.cursor);
    this.value = `${s1}${s2}`;
    this.red = false;
    if (this.isCursorAtStart()) {
      this.cursorOffset = 0
    } else {
      this.cursorOffset++;
      this.moveCursor(-1);
    }
    this.render();
  }

  deleteForward() {
    if(this.cursor*this.scale >= this.rendered.length || this.placeholder) return this.bell();
    let s1 = this.value.slice(0, this.cursor);
    let s2 = this.value.slice(this.cursor+1);
    this.value = `${s1}${s2}`;
    this.red = false;
    if (this.isCursorAtEnd()) {
      this.cursorOffset = 0;
    } else {
      this.cursorOffset++;
    }
    this.render();
  }

  first() {
    this.cursor = 0;
    this.render();
  }

  last() {
    this.cursor = this.value.length;
    this.render();
  }

  left() {
    if (this.cursor <= 0 || this.placeholder) return this.bell();
    this.moveCursor(-1);
    this.render();
  }

  right() {
    if (this.cursor*this.scale >= this.rendered.length || this.placeholder) return this.bell();
    this.moveCursor(1);
    this.render();
  }

  isCursorAtStart() {
    return this.cursor === 0 || (this.placeholder && this.cursor === 1);
  }

  isCursorAtEnd() {
    return this.cursor === this.rendered.length || (this.placeholder && this.cursor === this.rendered.length + 1)
  }

  render() {
    if (this.closed) return;
    if (!this.firstRender) {
      if (this.outputError)
        this.out.write(cursor.down(lines(this.outputError, this.out.columns) - 1) + clear(this.outputError, this.out.columns));
      this.out.write(clear(this.outputText, this.out.columns));
    }
    super.render();
    this.outputError = '';

    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(this.done),
      this.red ? color.red(this.rendered) : this.rendered
    ].join(` `);

    if (this.error) {
      this.outputError += this.errorMsg.split(`\n`)
          .reduce((a, l, i) => a + `\n${i ? ' ' : figures.pointerSmall} ${color.red().italic(l)}`, ``);
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore + cursor.move(this.cursorOffset, 0));
  }
}

module.exports = TextPrompt;

/***/ }),

/***/ 2093:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const color = __nccwpck_require__(5215);
const Prompt = __nccwpck_require__(4185);
const { style, clear } = __nccwpck_require__(9501);
const { cursor, erase } = __nccwpck_require__(9571);

/**
 * TogglePrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Boolean} [opts.initial=false] Default value
 * @param {String} [opts.active='no'] Active label
 * @param {String} [opts.inactive='off'] Inactive label
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */
class TogglePrompt extends Prompt {
  constructor(opts={}) {
    super(opts);
    this.msg = opts.message;
    this.value = !!opts.initial;
    this.active = opts.active || 'on';
    this.inactive = opts.inactive || 'off';
    this.initialValue = this.value;
    this.render();
  }

  reset() {
    this.value = this.initialValue;
    this.fire();
    this.render();
  }

  exit() {
    this.abort();
  }

  abort() {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  deactivate() {
    if (this.value === false) return this.bell();
    this.value = false;
    this.render();
  }

  activate() {
    if (this.value === true) return this.bell();
    this.value = true;
    this.render();
  }

  delete() {
    this.deactivate();
  }
  left() {
    this.deactivate();
  }
  right() {
    this.activate();
  }
  down() {
    this.deactivate();
  }
  up() {
    this.activate();
  }

  next() {
    this.value = !this.value;
    this.fire();
    this.render();
  }

  _(c, key) {
    if (c === ' ') {
      this.value = !this.value;
    } else if (c === '1') {
      this.value = true;
    } else if (c === '0') {
      this.value = false;
    } else return this.bell();
    this.render();
  }

  render() {
    if (this.closed) return;
    if (this.firstRender) this.out.write(cursor.hide);
    else this.out.write(clear(this.outputText, this.out.columns));
    super.render();

    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.msg),
      style.delimiter(this.done),
      this.value ? this.inactive : color.cyan().underline(this.inactive),
      color.gray('/'),
      this.value ? color.cyan().underline(this.active) : this.active
    ].join(' ');

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }
}

module.exports = TogglePrompt;


/***/ }),

/***/ 5379:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const prompts = __nccwpck_require__(1558);

const passOn = ['suggest', 'format', 'onState', 'validate', 'onRender', 'type'];
const noop = () => {};

/**
 * Prompt for a series of questions
 * @param {Array|Object} questions Single question object or Array of question objects
 * @param {Function} [onSubmit] Callback function called on prompt submit
 * @param {Function} [onCancel] Callback function called on cancel/abort
 * @returns {Object} Object with values from user input
 */
async function prompt(questions=[], { onSubmit=noop, onCancel=noop }={}) {
  const answers = {};
  const override = prompt._override || {};
  questions = [].concat(questions);
  let answer, question, quit, name, type, lastPrompt;

  const getFormattedAnswer = async (question, answer, skipValidation = false) => {
    if (!skipValidation && question.validate && question.validate(answer) !== true) {
      return;
    }
    return question.format ? await question.format(answer, answers) : answer
  };

  for (question of questions) {
    ({ name, type } = question);

    // evaluate type first and skip if type is a falsy value
    if (typeof type === 'function') {
      type = await type(answer, { ...answers }, question)
      question['type'] = type
    }
    if (!type) continue;

    // if property is a function, invoke it unless it's a special function
    for (let key in question) {
      if (passOn.includes(key)) continue;
      let value = question[key];
      question[key] = typeof value === 'function' ? await value(answer, { ...answers }, lastPrompt) : value;
    }

    lastPrompt = question;

    if (typeof question.message !== 'string') {
      throw new Error('prompt message is required');
    }

    // update vars in case they changed
    ({ name, type } = question);

    if (prompts[type] === void 0) {
      throw new Error(`prompt type (${type}) is not defined`);
    }

    if (override[question.name] !== undefined) {
      answer = await getFormattedAnswer(question, override[question.name]);
      if (answer !== undefined) {
        answers[name] = answer;
        continue;
      }
    }

    try {
      // Get the injected answer if there is one or prompt the user
      answer = prompt._injected ? getInjectedAnswer(prompt._injected, question.initial) : await prompts[type](question);
      answers[name] = answer = await getFormattedAnswer(question, answer, true);
      quit = await onSubmit(question, answer, answers);
    } catch (err) {
      quit = !(await onCancel(question, answers));
    }

    if (quit) return answers;
  }

  return answers;
}

function getInjectedAnswer(injected, deafultValue) {
  const answer = injected.shift();
    if (answer instanceof Error) {
      throw answer;
    }

    return (answer === undefined) ? deafultValue : answer;
}

function inject(answers) {
  prompt._injected = (prompt._injected || []).concat(answers);
}

function override(answers) {
  prompt._override = Object.assign({}, answers);
}

module.exports = Object.assign(prompt, { prompt, prompts, inject, override });


/***/ }),

/***/ 1558:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


const $ = exports;
const el = __nccwpck_require__(9098);
const noop = v => v;

function toPrompt(type, args, opts={}) {
  return new Promise((res, rej) => {
    const p = new el[type](args);
    const onAbort = opts.onAbort || noop;
    const onSubmit = opts.onSubmit || noop;
    const onExit = opts.onExit || noop;
    p.on('state', args.onState || noop);
    p.on('submit', x => res(onSubmit(x)));
    p.on('exit', x => res(onExit(x)));
    p.on('abort', x => rej(onAbort(x)));
  });
}

/**
 * Text prompt
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {function} [args.onState] On state change callback
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.text = args => toPrompt('TextPrompt', args);

/**
 * Password prompt with masked input
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {function} [args.onState] On state change callback
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.password = args => {
  args.style = 'password';
  return $.text(args);
};

/**
 * Prompt where input is invisible, like sudo
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {function} [args.onState] On state change callback
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.invisible = args => {
  args.style = 'invisible';
  return $.text(args);
};

/**
 * Number prompt
 * @param {string} args.message Prompt message to display
 * @param {number} args.initial Default number value
 * @param {function} [args.onState] On state change callback
 * @param {number} [args.max] Max value
 * @param {number} [args.min] Min value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {Boolean} [opts.float=false] Parse input as floats
 * @param {Number} [opts.round=2] Round floats to x decimals
 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.number = args => toPrompt('NumberPrompt', args);

/**
 * Date prompt
 * @param {string} args.message Prompt message to display
 * @param {number} args.initial Default number value
 * @param {function} [args.onState] On state change callback
 * @param {number} [args.max] Max value
 * @param {number} [args.min] Min value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {Boolean} [opts.float=false] Parse input as floats
 * @param {Number} [opts.round=2] Round floats to x decimals
 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.date = args => toPrompt('DatePrompt', args);

/**
 * Classic yes/no prompt
 * @param {string} args.message Prompt message to display
 * @param {boolean} [args.initial=false] Default value
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.confirm = args => toPrompt('ConfirmPrompt', args);

/**
 * List prompt, split intput string by `seperator`
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {string} [args.separator] String separator
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input, in form of an `Array`
 */
$.list = args => {
  const sep = args.separator || ',';
  return toPrompt('TextPrompt', args, {
    onSubmit: str => str.split(sep).map(s => s.trim())
  });
};

/**
 * Toggle/switch prompt
 * @param {string} args.message Prompt message to display
 * @param {boolean} [args.initial=false] Default value
 * @param {string} [args.active="on"] Text for `active` state
 * @param {string} [args.inactive="off"] Text for `inactive` state
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.toggle = args => toPrompt('TogglePrompt', args);

/**
 * Interactive select prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
 * @param {number} [args.initial] Index of default value
 * @param {String} [args.hint] Hint to display
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.select = args => toPrompt('SelectPrompt', args);

/**
 * Interactive multi-select / autocompleteMultiselect prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
 * @param {number} [args.max] Max select
 * @param {string} [args.hint] Hint to display user
 * @param {Number} [args.cursor=0] Cursor start position
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.multiselect = args => {
  args.choices = [].concat(args.choices || []);
  const toSelected = items => items.filter(item => item.selected).map(item => item.value);
  return toPrompt('MultiselectPrompt', args, {
    onAbort: toSelected,
    onSubmit: toSelected
  });
};

$.autocompleteMultiselect = args => {
  args.choices = [].concat(args.choices || []);
  const toSelected = items => items.filter(item => item.selected).map(item => item.value);
  return toPrompt('AutocompleteMultiselectPrompt', args, {
    onAbort: toSelected,
    onSubmit: toSelected
  });
};

const byTitle = (input, choices) => Promise.resolve(
  choices.filter(item => item.title.slice(0, input.length).toLowerCase() === input.toLowerCase())
);

/**
 * Interactive auto-complete prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of auto-complete choices objects `[{ title, value }, ...]`
 * @param {Function} [args.suggest] Function to filter results based on user input. Defaults to sort by `title`
 * @param {number} [args.limit=10] Max number of results to show
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {String} [args.initial] Index of the default value
 * @param {boolean} [opts.clearFirst] The first ESCAPE keypress will clear the input
 * @param {String} [args.fallback] Fallback message - defaults to initial value
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
$.autocomplete = args => {
  args.suggest = args.suggest || byTitle;
  args.choices = [].concat(args.choices || []);
  return toPrompt('AutocompletePrompt', args);
};


/***/ }),

/***/ 2337:
/***/ ((module) => {



module.exports = (key, isSelect) => {
  if (key.meta && key.name !== 'escape') return;
  
  if (key.ctrl) {
    if (key.name === 'a') return 'first';
    if (key.name === 'c') return 'abort';
    if (key.name === 'd') return 'abort';
    if (key.name === 'e') return 'last';
    if (key.name === 'g') return 'reset';
  }
  
  if (isSelect) {
    if (key.name === 'j') return 'down';
    if (key.name === 'k') return 'up';
  }

  if (key.name === 'return') return 'submit';
  if (key.name === 'enter') return 'submit'; // ctrl + J
  if (key.name === 'backspace') return 'delete';
  if (key.name === 'delete') return 'deleteForward';
  if (key.name === 'abort') return 'abort';
  if (key.name === 'escape') return 'exit';
  if (key.name === 'tab') return 'next';
  if (key.name === 'pagedown') return 'nextPage';
  if (key.name === 'pageup') return 'prevPage';
  // TODO create home() in prompt types (e.g. TextPrompt)
  if (key.name === 'home') return 'home';
  // TODO create end() in prompt types (e.g. TextPrompt)
  if (key.name === 'end') return 'end';

  if (key.name === 'up') return 'up';
  if (key.name === 'down') return 'down';
  if (key.name === 'right') return 'right';
  if (key.name === 'left') return 'left';

  return false;
};


/***/ }),

/***/ 4679:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const strip = __nccwpck_require__(6439);
const { erase, cursor } = __nccwpck_require__(9571);

const width = str => [...strip(str)].length;

/**
 * @param {string} prompt
 * @param {number} perLine
 */
module.exports = function(prompt, perLine) {
  if (!perLine) return erase.line + cursor.to(0);

  let rows = 0;
  const lines = prompt.split(/\r?\n/);
  for (let line of lines) {
    rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine);
  }

  return erase.lines(rows);
};


/***/ }),

/***/ 6740:
/***/ ((module) => {



/**
 * Determine what entries should be displayed on the screen, based on the
 * currently selected index and the maximum visible. Used in list-based
 * prompts like `select` and `multiselect`.
 *
 * @param {number} cursor the currently selected entry
 * @param {number} total the total entries available to display
 * @param {number} [maxVisible] the number of entries that can be displayed
 */
module.exports = (cursor, total, maxVisible)  => {
  maxVisible = maxVisible || total;

  let startIndex = Math.min(total- maxVisible, cursor - Math.floor(maxVisible / 2));
  if (startIndex < 0) startIndex = 0;

  let endIndex = Math.min(startIndex + maxVisible, total);

  return { startIndex, endIndex };
};


/***/ }),

/***/ 1918:
/***/ ((module) => {

	

 const main = {
  arrowUp: '↑',
  arrowDown: '↓',
  arrowLeft: '←',
  arrowRight: '→',
  radioOn: '◉',
  radioOff: '◯',
  tick: '✔',	
  cross: '✖',	
  ellipsis: '…',	
  pointerSmall: '›',	
  line: '─',	
  pointer: '❯'	
};	
const win = {
  arrowUp: main.arrowUp,
  arrowDown: main.arrowDown,
  arrowLeft: main.arrowLeft,
  arrowRight: main.arrowRight,
  radioOn: '(*)',
  radioOff: '( )',	
  tick: '√',	
  cross: '×',	
  ellipsis: '...',	
  pointerSmall: '»',	
  line: '─',	
  pointer: '>'	
};	
const figures = process.platform === 'win32' ? win : main;	

 module.exports = figures;


/***/ }),

/***/ 9501:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



module.exports = {
  action: __nccwpck_require__(2337),
  clear: __nccwpck_require__(4679),
  style: __nccwpck_require__(5290),
  strip: __nccwpck_require__(6439),
  figures: __nccwpck_require__(1918),
  lines: __nccwpck_require__(409),
  wrap: __nccwpck_require__(8861),
  entriesToDisplay: __nccwpck_require__(6740)
};


/***/ }),

/***/ 409:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const strip = __nccwpck_require__(6439);

/**
 * @param {string} msg
 * @param {number} perLine
 */
module.exports = function (msg, perLine) {
  let lines = String(strip(msg) || '').split(/\r?\n/);

  if (!perLine) return lines.length;
  return lines.map(l => Math.ceil(l.length / perLine))
      .reduce((a, b) => a + b);
};


/***/ }),

/***/ 6439:
/***/ ((module) => {



module.exports = str => {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))'
  ].join('|');

  const RGX = new RegExp(pattern, 'g');
  return typeof str === 'string' ? str.replace(RGX, '') : str;
};


/***/ }),

/***/ 5290:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const c = __nccwpck_require__(5215);
const figures = __nccwpck_require__(1918);

// rendering user input.
const styles = Object.freeze({
  password: { scale: 1, render: input => '*'.repeat(input.length) },
  emoji: { scale: 2, render: input => '😃'.repeat(input.length) },
  invisible: { scale: 0, render: input => '' },
  default: { scale: 1, render: input => `${input}` }
});
const render = type => styles[type] || styles.default;

// icon to signalize a prompt.
const symbols = Object.freeze({
  aborted: c.red(figures.cross),
  done: c.green(figures.tick),
  exited: c.yellow(figures.cross),
  default: c.cyan('?')
});

const symbol = (done, aborted, exited) =>
  aborted ? symbols.aborted : exited ? symbols.exited : done ? symbols.done : symbols.default;

// between the question and the user's input.
const delimiter = completing =>
  c.gray(completing ? figures.ellipsis : figures.pointerSmall);

const item = (expandable, expanded) =>
  c.gray(expandable ? (expanded ? figures.pointerSmall : '+') : figures.line);

module.exports = {
  styles,
  render,
  symbols,
  symbol,
  delimiter,
  item
};


/***/ }),

/***/ 8861:
/***/ ((module) => {



/**
 * @param {string} msg The message to wrap
 * @param {object} opts
 * @param {number|string} [opts.margin] Left margin
 * @param {number} opts.width Maximum characters per line including the margin
 */
module.exports = (msg, opts = {}) => {
  const tab = Number.isSafeInteger(parseInt(opts.margin))
    ? new Array(parseInt(opts.margin)).fill(' ').join('')
    : (opts.margin || '');

  const width = opts.width;

  return (msg || '').split(/\r?\n/g)
    .map(line => line
      .split(/\s+/g)
      .reduce((arr, w) => {
        if (w.length + tab.length >= width || arr[arr.length - 1].length + w.length + 1 < width)
          arr[arr.length - 1] += ` ${w}`;
        else arr.push(`${tab}${w}`);
        return arr;
      }, [ tab ])
      .join('\n'))
    .join('\n');
};


/***/ }),

/***/ 1532:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const ANY = Symbol('SemVer ANY')
// hoisted class for cyclic dependency
class Comparator {
  static get ANY () {
    return ANY
  }

  constructor (comp, options) {
    options = parseOptions(options)

    if (comp instanceof Comparator) {
      if (comp.loose === !!options.loose) {
        return comp
      } else {
        comp = comp.value
      }
    }

    debug('comparator', comp, options)
    this.options = options
    this.loose = !!options.loose
    this.parse(comp)

    if (this.semver === ANY) {
      this.value = ''
    } else {
      this.value = this.operator + this.semver.version
    }

    debug('comp', this)
  }

  parse (comp) {
    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
    const m = comp.match(r)

    if (!m) {
      throw new TypeError(`Invalid comparator: ${comp}`)
    }

    this.operator = m[1] !== undefined ? m[1] : ''
    if (this.operator === '=') {
      this.operator = ''
    }

    // if it literally is just '>' or '' then allow anything.
    if (!m[2]) {
      this.semver = ANY
    } else {
      this.semver = new SemVer(m[2], this.options.loose)
    }
  }

  toString () {
    return this.value
  }

  test (version) {
    debug('Comparator.test', version, this.options.loose)

    if (this.semver === ANY || version === ANY) {
      return true
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    return cmp(version, this.operator, this.semver, this.options)
  }

  intersects (comp, options) {
    if (!(comp instanceof Comparator)) {
      throw new TypeError('a Comparator is required')
    }

    if (this.operator === '') {
      if (this.value === '') {
        return true
      }
      return new Range(comp.value, options).test(this.value)
    } else if (comp.operator === '') {
      if (comp.value === '') {
        return true
      }
      return new Range(this.value, options).test(comp.semver)
    }

    options = parseOptions(options)

    // Special cases where nothing can possibly be lower
    if (options.includePrerelease &&
      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
      return false
    }
    if (!options.includePrerelease &&
      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
      return false
    }

    // Same direction increasing (> or >=)
    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
      return true
    }
    // Same direction decreasing (< or <=)
    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
      return true
    }
    // same SemVer and both sides are inclusive (<= or >=)
    if (
      (this.semver.version === comp.semver.version) &&
      this.operator.includes('=') && comp.operator.includes('=')) {
      return true
    }
    // opposite directions less than
    if (cmp(this.semver, '<', comp.semver, options) &&
      this.operator.startsWith('>') && comp.operator.startsWith('<')) {
      return true
    }
    // opposite directions greater than
    if (cmp(this.semver, '>', comp.semver, options) &&
      this.operator.startsWith('<') && comp.operator.startsWith('>')) {
      return true
    }
    return false
  }
}

module.exports = Comparator

const parseOptions = __nccwpck_require__(785)
const { re, t } = __nccwpck_require__(9523)
const cmp = __nccwpck_require__(5098)
const debug = __nccwpck_require__(427)
const SemVer = __nccwpck_require__(8088)
const Range = __nccwpck_require__(9828)


/***/ }),

/***/ 9828:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// hoisted class for cyclic dependency
class Range {
  constructor (range, options) {
    options = parseOptions(options)

    if (range instanceof Range) {
      if (
        range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease
      ) {
        return range
      } else {
        return new Range(range.raw, options)
      }
    }

    if (range instanceof Comparator) {
      // just put it in the set and return
      this.raw = range.value
      this.set = [[range]]
      this.format()
      return this
    }

    this.options = options
    this.loose = !!options.loose
    this.includePrerelease = !!options.includePrerelease

    // First, split based on boolean or ||
    this.raw = range
    this.set = range
      .split('||')
      // map the range to a 2d array of comparators
      .map(r => this.parseRange(r.trim()))
      // throw out any comparator lists that are empty
      // this generally means that it was not a valid range, which is allowed
      // in loose mode, but will still throw if the WHOLE range is invalid.
      .filter(c => c.length)

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${range}`)
    }

    // if we have any that are not the null set, throw out null sets.
    if (this.set.length > 1) {
      // keep the first one, in case they're all null sets
      const first = this.set[0]
      this.set = this.set.filter(c => !isNullSet(c[0]))
      if (this.set.length === 0) {
        this.set = [first]
      } else if (this.set.length > 1) {
        // if we have any that are *, then the range is just *
        for (const c of this.set) {
          if (c.length === 1 && isAny(c[0])) {
            this.set = [c]
            break
          }
        }
      }
    }

    this.format()
  }

  format () {
    this.range = this.set
      .map((comps) => {
        return comps.join(' ').trim()
      })
      .join('||')
      .trim()
    return this.range
  }

  toString () {
    return this.range
  }

  parseRange (range) {
    range = range.trim()

    // memoize range parsing for performance.
    // this is a very hot path, and fully deterministic.
    const memoOpts =
      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
      (this.options.loose && FLAG_LOOSE)
    const memoKey = memoOpts + ':' + range
    const cached = cache.get(memoKey)
    if (cached) {
      return cached
    }

    const loose = this.options.loose
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]
    range = range.replace(hr, hyphenReplace(this.options.includePrerelease))
    debug('hyphen replace', range)
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace)
    debug('comparator trim', range)

    // `~ 1.2.3` => `~1.2.3`
    range = range.replace(re[t.TILDETRIM], tildeTrimReplace)

    // `^ 1.2.3` => `^1.2.3`
    range = range.replace(re[t.CARETTRIM], caretTrimReplace)

    // normalize spaces
    range = range.split(/\s+/).join(' ')

    // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    let rangeList = range
      .split(' ')
      .map(comp => parseComparator(comp, this.options))
      .join(' ')
      .split(/\s+/)
      // >=0.0.0 is equivalent to *
      .map(comp => replaceGTE0(comp, this.options))

    if (loose) {
      // in loose mode, throw out any that are not valid comparators
      rangeList = rangeList.filter(comp => {
        debug('loose invalid filter', comp, this.options)
        return !!comp.match(re[t.COMPARATORLOOSE])
      })
    }
    debug('range list', rangeList)

    // if any comparators are the null set, then replace with JUST null set
    // if more than one comparator, remove any * comparators
    // also, don't include the same comparator more than once
    const rangeMap = new Map()
    const comparators = rangeList.map(comp => new Comparator(comp, this.options))
    for (const comp of comparators) {
      if (isNullSet(comp)) {
        return [comp]
      }
      rangeMap.set(comp.value, comp)
    }
    if (rangeMap.size > 1 && rangeMap.has('')) {
      rangeMap.delete('')
    }

    const result = [...rangeMap.values()]
    cache.set(memoKey, result)
    return result
  }

  intersects (range, options) {
    if (!(range instanceof Range)) {
      throw new TypeError('a Range is required')
    }

    return this.set.some((thisComparators) => {
      return (
        isSatisfiable(thisComparators, options) &&
        range.set.some((rangeComparators) => {
          return (
            isSatisfiable(rangeComparators, options) &&
            thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options)
              })
            })
          )
        })
      )
    })
  }

  // if ANY of the sets match ALL of its comparators, then pass
  test (version) {
    if (!version) {
      return false
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    for (let i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version, this.options)) {
        return true
      }
    }
    return false
  }
}

module.exports = Range

const LRU = __nccwpck_require__(7129)
const cache = new LRU({ max: 1000 })

const parseOptions = __nccwpck_require__(785)
const Comparator = __nccwpck_require__(1532)
const debug = __nccwpck_require__(427)
const SemVer = __nccwpck_require__(8088)
const {
  re,
  t,
  comparatorTrimReplace,
  tildeTrimReplace,
  caretTrimReplace,
} = __nccwpck_require__(9523)
const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = __nccwpck_require__(2293)

const isNullSet = c => c.value === '<0.0.0-0'
const isAny = c => c.value === ''

// take a set of comparators and determine whether there
// exists a version which can satisfy it
const isSatisfiable = (comparators, options) => {
  let result = true
  const remainingComparators = comparators.slice()
  let testComparator = remainingComparators.pop()

  while (result && remainingComparators.length) {
    result = remainingComparators.every((otherComparator) => {
      return testComparator.intersects(otherComparator, options)
    })

    testComparator = remainingComparators.pop()
  }

  return result
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
const parseComparator = (comp, options) => {
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

const isX = id => !id || id.toLowerCase() === 'x' || id === '*'

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
// ~0.0.1 --> >=0.0.1 <0.1.0-0
const replaceTildes = (comp, options) =>
  comp.trim().split(/\s+/).map((c) => {
    return replaceTilde(c, options)
  }).join(' ')

const replaceTilde = (comp, options) => {
  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('tilde', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0-0
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`
    } else if (pr) {
      debug('replaceTilde pr', pr)
      ret = `>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0-0`
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0-0
      ret = `>=${M}.${m}.${p
      } <${M}.${+m + 1}.0-0`
    }

    debug('tilde return', ret)
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0
// ^0.0.1 --> >=0.0.1 <0.0.2-0
// ^0.1.0 --> >=0.1.0 <0.2.0-0
const replaceCarets = (comp, options) =>
  comp.trim().split(/\s+/).map((c) => {
    return replaceCaret(c, options)
  }).join(' ')

const replaceCaret = (comp, options) => {
  debug('caret', comp, options)
  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]
  const z = options.includePrerelease ? '-0' : ''
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('caret', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`
    } else if (isX(p)) {
      if (M === '0') {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`
      }
    } else if (pr) {
      debug('replaceCaret pr', pr)
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}-0`
        } else {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0-0`
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0-0`
      }
    } else {
      debug('no pr')
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${m}.${+p + 1}-0`
        } else {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${+m + 1}.0-0`
        }
      } else {
        ret = `>=${M}.${m}.${p
        } <${+M + 1}.0.0-0`
      }
    }

    debug('caret return', ret)
    return ret
  })
}

const replaceXRanges = (comp, options) => {
  debug('replaceXRanges', comp, options)
  return comp.split(/\s+/).map((c) => {
    return replaceXRange(c, options)
  }).join(' ')
}

const replaceXRange = (comp, options) => {
  comp = comp.trim()
  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    debug('xRange', comp, ret, gtlt, M, m, p, pr)
    const xM = isX(M)
    const xm = xM || isX(m)
    const xp = xm || isX(p)
    const anyX = xp

    if (gtlt === '=' && anyX) {
      gtlt = ''
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : ''

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0'
      } else {
        // nothing is forbidden
        ret = '*'
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0
      }
      p = 0

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        gtlt = '>='
        if (xm) {
          M = +M + 1
          m = 0
          p = 0
        } else {
          m = +m + 1
          p = 0
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm) {
          M = +M + 1
        } else {
          m = +m + 1
        }
      }

      if (gtlt === '<') {
        pr = '-0'
      }

      ret = `${gtlt + M}.${m}.${p}${pr}`
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0-0`
    }

    debug('xRange return', ret)

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
const replaceStars = (comp, options) => {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[t.STAR], '')
}

const replaceGTE0 = (comp, options) => {
  debug('replaceGTE0', comp, options)
  return comp.trim()
    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
}

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
const hyphenReplace = incPr => ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) => {
  if (isX(fM)) {
    from = ''
  } else if (isX(fm)) {
    from = `>=${fM}.0.0${incPr ? '-0' : ''}`
  } else if (isX(fp)) {
    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`
  } else if (fpr) {
    from = `>=${from}`
  } else {
    from = `>=${from}${incPr ? '-0' : ''}`
  }

  if (isX(tM)) {
    to = ''
  } else if (isX(tm)) {
    to = `<${+tM + 1}.0.0-0`
  } else if (isX(tp)) {
    to = `<${tM}.${+tm + 1}.0-0`
  } else if (tpr) {
    to = `<=${tM}.${tm}.${tp}-${tpr}`
  } else if (incPr) {
    to = `<${tM}.${tm}.${+tp + 1}-0`
  } else {
    to = `<=${to}`
  }

  return (`${from} ${to}`).trim()
}

const testSet = (set, version, options) => {
  for (let i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (let i = 0; i < set.length; i++) {
      debug(set[i].semver)
      if (set[i].semver === Comparator.ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        const allowed = set[i].semver
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}


/***/ }),

/***/ 8088:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const debug = __nccwpck_require__(427)
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __nccwpck_require__(2293)
const { re, t } = __nccwpck_require__(9523)

const parseOptions = __nccwpck_require__(785)
const { compareIdentifiers } = __nccwpck_require__(2463)
class SemVer {
  constructor (version, options) {
    options = parseOptions(options)

    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options)
    this.options = options
    this.loose = !!options.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }

    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other)
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options)
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = other.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    let i = 0
    do {
      const a = this.build[i]
      const b = other.build[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier, identifierBase) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier, identifierBase)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier, identifierBase)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier, identifierBase)
        this.inc('pre', identifier, identifierBase)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier, identifierBase)
        }
        this.inc('pre', identifier, identifierBase)
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0)
          }
        }
        if (identifier) {
          const base = Number(identifierBase) ? 1 : 0
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, base]
            }
          } else {
            this.prerelease = [identifier, base]
          }
        }
        break

      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format()
    this.raw = this.version
    return this
  }
}

module.exports = SemVer


/***/ }),

/***/ 8848:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const parse = __nccwpck_require__(5925)
const clean = (version, options) => {
  const s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}
module.exports = clean


/***/ }),

/***/ 5098:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const eq = __nccwpck_require__(1898)
const neq = __nccwpck_require__(6017)
const gt = __nccwpck_require__(4123)
const gte = __nccwpck_require__(5522)
const lt = __nccwpck_require__(194)
const lte = __nccwpck_require__(7520)

const cmp = (a, op, b, loose) => {
  switch (op) {
    case '===':
      if (typeof a === 'object') {
        a = a.version
      }
      if (typeof b === 'object') {
        b = b.version
      }
      return a === b

    case '!==':
      if (typeof a === 'object') {
        a = a.version
      }
      if (typeof b === 'object') {
        b = b.version
      }
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError(`Invalid operator: ${op}`)
  }
}
module.exports = cmp


/***/ }),

/***/ 3466:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const parse = __nccwpck_require__(5925)
const { re, t } = __nccwpck_require__(9523)

const coerce = (version, options) => {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version)
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {}

  let match = null
  if (!options.rtl) {
    match = version.match(re[t.COERCE])
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    let next
    while ((next = re[t.COERCERTL].exec(version)) &&
        (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
            next.index + next[0].length !== match.index + match[0].length) {
        match = next
      }
      re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length
    }
    // leave it in a clean state
    re[t.COERCERTL].lastIndex = -1
  }

  if (match === null) {
    return null
  }

  return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
}
module.exports = coerce


/***/ }),

/***/ 2156:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const compareBuild = (a, b, loose) => {
  const versionA = new SemVer(a, loose)
  const versionB = new SemVer(b, loose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}
module.exports = compareBuild


/***/ }),

/***/ 2804:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const compareLoose = (a, b) => compare(a, b, true)
module.exports = compareLoose


/***/ }),

/***/ 4309:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const compare = (a, b, loose) =>
  new SemVer(a, loose).compare(new SemVer(b, loose))

module.exports = compare


/***/ }),

/***/ 4297:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const parse = __nccwpck_require__(5925)
const eq = __nccwpck_require__(1898)

const diff = (version1, version2) => {
  const v1 = parse(version1)
  const v2 = parse(version2)
  if (eq(v1, v2)) {
    return null
  } else {
    const hasPre = v1.prerelease.length || v2.prerelease.length
    const prefix = hasPre ? 'pre' : ''
    const defaultResult = hasPre ? 'prerelease' : ''

    if (v1.major !== v2.major) {
      return prefix + 'major'
    }
    if (v1.minor !== v2.minor) {
      return prefix + 'minor'
    }

    if (v1.patch !== v2.patch) {
      return prefix + 'patch'
    }

    if (!v1.prerelease.length || !v2.prerelease.length) {
      if (v1.patch) {
        return 'patch'
      }
      if (v1.minor) {
        return 'minor'
      }
      if (v1.major) {
        return 'major'
      }
    }
    return defaultResult // may be undefined
  }
}
module.exports = diff


/***/ }),

/***/ 1898:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const eq = (a, b, loose) => compare(a, b, loose) === 0
module.exports = eq


/***/ }),

/***/ 4123:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const gt = (a, b, loose) => compare(a, b, loose) > 0
module.exports = gt


/***/ }),

/***/ 5522:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const gte = (a, b, loose) => compare(a, b, loose) >= 0
module.exports = gte


/***/ }),

/***/ 900:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)

const inc = (version, release, options, identifier, identifierBase) => {
  if (typeof (options) === 'string') {
    identifierBase = identifier
    identifier = options
    options = undefined
  }

  try {
    return new SemVer(
      version instanceof SemVer ? version.version : version,
      options
    ).inc(release, identifier, identifierBase).version
  } catch (er) {
    return null
  }
}
module.exports = inc


/***/ }),

/***/ 194:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const lt = (a, b, loose) => compare(a, b, loose) < 0
module.exports = lt


/***/ }),

/***/ 7520:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const lte = (a, b, loose) => compare(a, b, loose) <= 0
module.exports = lte


/***/ }),

/***/ 6688:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const major = (a, loose) => new SemVer(a, loose).major
module.exports = major


/***/ }),

/***/ 8447:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const minor = (a, loose) => new SemVer(a, loose).minor
module.exports = minor


/***/ }),

/***/ 6017:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const neq = (a, b, loose) => compare(a, b, loose) !== 0
module.exports = neq


/***/ }),

/***/ 5925:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { MAX_LENGTH } = __nccwpck_require__(2293)
const SemVer = __nccwpck_require__(8088)
const parse = (version, options) => {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

module.exports = parse


/***/ }),

/***/ 2866:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const patch = (a, loose) => new SemVer(a, loose).patch
module.exports = patch


/***/ }),

/***/ 4016:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const parse = __nccwpck_require__(5925)
const prerelease = (version, options) => {
  const parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}
module.exports = prerelease


/***/ }),

/***/ 6417:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compare = __nccwpck_require__(4309)
const rcompare = (a, b, loose) => compare(b, a, loose)
module.exports = rcompare


/***/ }),

/***/ 8701:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compareBuild = __nccwpck_require__(2156)
const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))
module.exports = rsort


/***/ }),

/***/ 6055:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Range = __nccwpck_require__(9828)
const satisfies = (version, range, options) => {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}
module.exports = satisfies


/***/ }),

/***/ 1426:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const compareBuild = __nccwpck_require__(2156)
const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))
module.exports = sort


/***/ }),

/***/ 9601:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const parse = __nccwpck_require__(5925)
const valid = (version, options) => {
  const v = parse(version, options)
  return v ? v.version : null
}
module.exports = valid


/***/ }),

/***/ 1383:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// just pre-load all the stuff that index.js lazily exports
const internalRe = __nccwpck_require__(9523)
const constants = __nccwpck_require__(2293)
const SemVer = __nccwpck_require__(8088)
const identifiers = __nccwpck_require__(2463)
const parse = __nccwpck_require__(5925)
const valid = __nccwpck_require__(9601)
const clean = __nccwpck_require__(8848)
const inc = __nccwpck_require__(900)
const diff = __nccwpck_require__(4297)
const major = __nccwpck_require__(6688)
const minor = __nccwpck_require__(8447)
const patch = __nccwpck_require__(2866)
const prerelease = __nccwpck_require__(4016)
const compare = __nccwpck_require__(4309)
const rcompare = __nccwpck_require__(6417)
const compareLoose = __nccwpck_require__(2804)
const compareBuild = __nccwpck_require__(2156)
const sort = __nccwpck_require__(1426)
const rsort = __nccwpck_require__(8701)
const gt = __nccwpck_require__(4123)
const lt = __nccwpck_require__(194)
const eq = __nccwpck_require__(1898)
const neq = __nccwpck_require__(6017)
const gte = __nccwpck_require__(5522)
const lte = __nccwpck_require__(7520)
const cmp = __nccwpck_require__(5098)
const coerce = __nccwpck_require__(3466)
const Comparator = __nccwpck_require__(1532)
const Range = __nccwpck_require__(9828)
const satisfies = __nccwpck_require__(6055)
const toComparators = __nccwpck_require__(2706)
const maxSatisfying = __nccwpck_require__(579)
const minSatisfying = __nccwpck_require__(832)
const minVersion = __nccwpck_require__(4179)
const validRange = __nccwpck_require__(2098)
const outside = __nccwpck_require__(420)
const gtr = __nccwpck_require__(9380)
const ltr = __nccwpck_require__(3323)
const intersects = __nccwpck_require__(7008)
const simplifyRange = __nccwpck_require__(5297)
const subset = __nccwpck_require__(7863)
module.exports = {
  parse,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
  SemVer,
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: constants.RELEASE_TYPES,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers,
}


/***/ }),

/***/ 2293:
/***/ ((module) => {

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0'

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
/* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16

const RELEASE_TYPES = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
]

module.exports = {
  MAX_LENGTH,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_INTEGER,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 0b001,
  FLAG_LOOSE: 0b010,
}


/***/ }),

/***/ 427:
/***/ ((module) => {

const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug


/***/ }),

/***/ 2463:
/***/ ((module) => {

const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
  const anum = numeric.test(a)
  const bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers,
}


/***/ }),

/***/ 785:
/***/ ((module) => {

// parse out just the options we care about
const looseOption = Object.freeze({ loose: true })
const emptyOpts = Object.freeze({ })
const parseOptions = options => {
  if (!options) {
    return emptyOpts
  }

  if (typeof options !== 'object') {
    return looseOption
  }

  return options
}
module.exports = parseOptions


/***/ }),

/***/ 9523:
/***/ ((module, exports, __nccwpck_require__) => {

const { MAX_SAFE_COMPONENT_LENGTH } = __nccwpck_require__(2293)
const debug = __nccwpck_require__(427)
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const src = exports.src = []
const t = exports.t = {}
let R = 0

const createToken = (name, value, isGlobal) => {
  const index = R++
  debug(name, index, value)
  t[name] = index
  src[index] = value
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+')

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*')

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`)

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`)

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+')

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)

createToken('FULL', `^${src[t.FULLPLAIN]}$`)

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)

createToken('GTLT', '((?:<|>)?=?)')

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`)

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`)

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)')

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
exports.tildeTrimReplace = '$1~'

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)')

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
exports.caretTrimReplace = '$1^'

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
exports.comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`)

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`)

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*')
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$')
createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$')


/***/ }),

/***/ 9380:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// Determine if version is greater than all the versions possible in the range.
const outside = __nccwpck_require__(420)
const gtr = (version, range, options) => outside(version, range, '>', options)
module.exports = gtr


/***/ }),

/***/ 7008:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Range = __nccwpck_require__(9828)
const intersects = (r1, r2, options) => {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2, options)
}
module.exports = intersects


/***/ }),

/***/ 3323:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const outside = __nccwpck_require__(420)
// Determine if version is less than all the versions possible in the range
const ltr = (version, range, options) => outside(version, range, '<', options)
module.exports = ltr


/***/ }),

/***/ 579:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const Range = __nccwpck_require__(9828)

const maxSatisfying = (versions, range, options) => {
  let max = null
  let maxSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, options)
      }
    }
  })
  return max
}
module.exports = maxSatisfying


/***/ }),

/***/ 832:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const Range = __nccwpck_require__(9828)
const minSatisfying = (versions, range, options) => {
  let min = null
  let minSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, options)
      }
    }
  })
  return min
}
module.exports = minSatisfying


/***/ }),

/***/ 4179:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const Range = __nccwpck_require__(9828)
const gt = __nccwpck_require__(4123)

const minVersion = (range, loose) => {
  range = new Range(range, loose)

  let minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (range.test(minver)) {
    return minver
  }

  minver = null
  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    let setMin = null
    comparators.forEach((comparator) => {
      // Clone to avoid manipulating the comparator's semver object.
      const compver = new SemVer(comparator.semver.version)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          } else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!setMin || gt(compver, setMin)) {
            setMin = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`)
      }
    })
    if (setMin && (!minver || gt(minver, setMin))) {
      minver = setMin
    }
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}
module.exports = minVersion


/***/ }),

/***/ 420:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const SemVer = __nccwpck_require__(8088)
const Comparator = __nccwpck_require__(1532)
const { ANY } = Comparator
const Range = __nccwpck_require__(9828)
const satisfies = __nccwpck_require__(6055)
const gt = __nccwpck_require__(4123)
const lt = __nccwpck_require__(194)
const lte = __nccwpck_require__(7520)
const gte = __nccwpck_require__(5522)

const outside = (version, range, hilo, options) => {
  version = new SemVer(version, options)
  range = new Range(range, options)

  let gtfn, ltefn, ltfn, comp, ecomp
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisfies the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    let high = null
    let low = null

    comparators.forEach((comparator) => {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator
      low = low || comparator
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator
      }
    })

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

module.exports = outside


/***/ }),

/***/ 5297:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
const satisfies = __nccwpck_require__(6055)
const compare = __nccwpck_require__(4309)
module.exports = (versions, range, options) => {
  const set = []
  let first = null
  let prev = null
  const v = versions.sort((a, b) => compare(a, b, options))
  for (const version of v) {
    const included = satisfies(version, range, options)
    if (included) {
      prev = version
      if (!first) {
        first = version
      }
    } else {
      if (prev) {
        set.push([first, prev])
      }
      prev = null
      first = null
    }
  }
  if (first) {
    set.push([first, null])
  }

  const ranges = []
  for (const [min, max] of set) {
    if (min === max) {
      ranges.push(min)
    } else if (!max && min === v[0]) {
      ranges.push('*')
    } else if (!max) {
      ranges.push(`>=${min}`)
    } else if (min === v[0]) {
      ranges.push(`<=${max}`)
    } else {
      ranges.push(`${min} - ${max}`)
    }
  }
  const simplified = ranges.join(' || ')
  const original = typeof range.raw === 'string' ? range.raw : String(range)
  return simplified.length < original.length ? simplified : range
}


/***/ }),

/***/ 7863:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Range = __nccwpck_require__(9828)
const Comparator = __nccwpck_require__(1532)
const { ANY } = Comparator
const satisfies = __nccwpck_require__(6055)
const compare = __nccwpck_require__(4309)

// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else if in prerelease mode, return false
//   - else replace c with `[>=0.0.0]`
// - If C is only the ANY comparator
//   - if in prerelease mode, return true
//   - else replace C with `[>=0.0.0]`
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If any C is a = range, and GT or LT are set, return false
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT.semver is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the GT.semver tuple, return false
// - If LT
//   - If LT.semver is greater than any < or <= comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the LT.semver tuple, return false
// - Else return true

const subset = (sub, dom, options = {}) => {
  if (sub === dom) {
    return true
  }

  sub = new Range(sub, options)
  dom = new Range(dom, options)
  let sawNonNull = false

  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options)
      sawNonNull = sawNonNull || isSub !== null
      if (isSub) {
        continue OUTER
      }
    }
    // the null set is a subset of everything, but null simple ranges in
    // a complex range should be ignored.  so if we saw a non-null range,
    // then we know this isn't a subset, but if EVERY simple range was null,
    // then it is a subset.
    if (sawNonNull) {
      return false
    }
  }
  return true
}

const minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')]
const minimumVersion = [new Comparator('>=0.0.0')]

const simpleSubset = (sub, dom, options) => {
  if (sub === dom) {
    return true
  }

  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY) {
      return true
    } else if (options.includePrerelease) {
      sub = minimumVersionWithPreRelease
    } else {
      sub = minimumVersion
    }
  }

  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options.includePrerelease) {
      return true
    } else {
      dom = minimumVersion
    }
  }

  const eqSet = new Set()
  let gt, lt
  for (const c of sub) {
    if (c.operator === '>' || c.operator === '>=') {
      gt = higherGT(gt, c, options)
    } else if (c.operator === '<' || c.operator === '<=') {
      lt = lowerLT(lt, c, options)
    } else {
      eqSet.add(c.semver)
    }
  }

  if (eqSet.size > 1) {
    return null
  }

  let gtltComp
  if (gt && lt) {
    gtltComp = compare(gt.semver, lt.semver, options)
    if (gtltComp > 0) {
      return null
    } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
      return null
    }
  }

  // will iterate one or zero times
  for (const eq of eqSet) {
    if (gt && !satisfies(eq, String(gt), options)) {
      return null
    }

    if (lt && !satisfies(eq, String(lt), options)) {
      return null
    }

    for (const c of dom) {
      if (!satisfies(eq, String(c), options)) {
        return false
      }
    }

    return true
  }

  let higher, lower
  let hasDomLT, hasDomGT
  // if the subset has a prerelease, we need a comparator in the superset
  // with the same tuple and a prerelease, or it's not a subset
  let needDomLTPre = lt &&
    !options.includePrerelease &&
    lt.semver.prerelease.length ? lt.semver : false
  let needDomGTPre = gt &&
    !options.includePrerelease &&
    gt.semver.prerelease.length ? gt.semver : false
  // exception: <1.2.3-0 is the same as <1.2.3
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false
  }

  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>='
    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<='
    if (gt) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomGTPre.major &&
            c.semver.minor === needDomGTPre.minor &&
            c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false
        }
      }
      if (c.operator === '>' || c.operator === '>=') {
        higher = higherGT(gt, c, options)
        if (higher === c && higher !== gt) {
          return false
        }
      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {
        return false
      }
    }
    if (lt) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomLTPre.major &&
            c.semver.minor === needDomLTPre.minor &&
            c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false
        }
      }
      if (c.operator === '<' || c.operator === '<=') {
        lower = lowerLT(lt, c, options)
        if (lower === c && lower !== lt) {
          return false
        }
      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {
        return false
      }
    }
    if (!c.operator && (lt || gt) && gtltComp !== 0) {
      return false
    }
  }

  // if there was a < or >, and nothing in the dom, then must be false
  // UNLESS it was limited by another range in the other direction.
  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
  if (gt && hasDomLT && !lt && gtltComp !== 0) {
    return false
  }

  if (lt && hasDomGT && !gt && gtltComp !== 0) {
    return false
  }

  // we needed a prerelease range in a specific tuple, but didn't get one
  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
  // because it includes prereleases in the 1.2.3 tuple
  if (needDomGTPre || needDomLTPre) {
    return false
  }

  return true
}

// >=1.2.3 is lower than >1.2.3
const higherGT = (a, b, options) => {
  if (!a) {
    return b
  }
  const comp = compare(a.semver, b.semver, options)
  return comp > 0 ? a
    : comp < 0 ? b
    : b.operator === '>' && a.operator === '>=' ? b
    : a
}

// <=1.2.3 is higher than <1.2.3
const lowerLT = (a, b, options) => {
  if (!a) {
    return b
  }
  const comp = compare(a.semver, b.semver, options)
  return comp < 0 ? a
    : comp > 0 ? b
    : b.operator === '<' && a.operator === '<=' ? b
    : a
}

module.exports = subset


/***/ }),

/***/ 2706:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Range = __nccwpck_require__(9828)

// Mostly just for testing and legacy API reasons
const toComparators = (range, options) =>
  new Range(range, options).set
    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '))

module.exports = toComparators


/***/ }),

/***/ 2098:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Range = __nccwpck_require__(9828)
const validRange = (range, options) => {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}
module.exports = validRange


/***/ }),

/***/ 9571:
/***/ ((module) => {



const ESC = '\x1B';
const CSI = `${ESC}[`;
const beep = '\u0007';

const cursor = {
  to(x, y) {
    if (!y) return `${CSI}${x + 1}G`;
    return `${CSI}${y + 1};${x + 1}H`;
  },
  move(x, y) {
    let ret = '';

    if (x < 0) ret += `${CSI}${-x}D`;
    else if (x > 0) ret += `${CSI}${x}C`;

    if (y < 0) ret += `${CSI}${-y}A`;
    else if (y > 0) ret += `${CSI}${y}B`;

    return ret;
  },
  up: (count = 1) => `${CSI}${count}A`,
  down: (count = 1) => `${CSI}${count}B`,
  forward: (count = 1) => `${CSI}${count}C`,
  backward: (count = 1) => `${CSI}${count}D`,
  nextLine: (count = 1) => `${CSI}E`.repeat(count),
  prevLine: (count = 1) => `${CSI}F`.repeat(count),
  left: `${CSI}G`,
  hide: `${CSI}?25l`,
  show: `${CSI}?25h`,
  save: `${ESC}7`,
  restore: `${ESC}8`
}

const scroll = {
  up: (count = 1) => `${CSI}S`.repeat(count),
  down: (count = 1) => `${CSI}T`.repeat(count)
}

const erase = {
  screen: `${CSI}2J`,
  up: (count = 1) => `${CSI}1J`.repeat(count),
  down: (count = 1) => `${CSI}J`.repeat(count),
  line: `${CSI}2K`,
  lineEnd: `${CSI}K`,
  lineStart: `${CSI}1K`,
  lines(count) {
    let clear = '';
    for (let i = 0; i < count; i++)
      clear += this.line + (i < count - 1 ? cursor.up() : '');
    if (count)
      clear += cursor.left;
    return clear;
  }
}

module.exports = { cursor, scroll, erase, beep };


/***/ }),

/***/ 4006:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



var scopedPackagePattern = new RegExp('^(?:@([^/]+?)[/])?([^/]+?)$')
var builtins = __nccwpck_require__(3818)
var blacklist = [
  'node_modules',
  'favicon.ico',
]

function validate (name) {
  var warnings = []
  var errors = []

  if (name === null) {
    errors.push('name cannot be null')
    return done(warnings, errors)
  }

  if (name === undefined) {
    errors.push('name cannot be undefined')
    return done(warnings, errors)
  }

  if (typeof name !== 'string') {
    errors.push('name must be a string')
    return done(warnings, errors)
  }

  if (!name.length) {
    errors.push('name length must be greater than zero')
  }

  if (name.match(/^\./)) {
    errors.push('name cannot start with a period')
  }

  if (name.match(/^_/)) {
    errors.push('name cannot start with an underscore')
  }

  if (name.trim() !== name) {
    errors.push('name cannot contain leading or trailing spaces')
  }

  // No funny business
  blacklist.forEach(function (blacklistedName) {
    if (name.toLowerCase() === blacklistedName) {
      errors.push(blacklistedName + ' is a blacklisted name')
    }
  })

  // Generate warnings for stuff that used to be allowed

  // core module names like http, events, util, etc
  builtins({ version: '*' }).forEach(function (builtin) {
    if (name.toLowerCase() === builtin) {
      warnings.push(builtin + ' is a core module name')
    }
  })

  if (name.length > 214) {
    warnings.push('name can no longer contain more than 214 characters')
  }

  // mIxeD CaSe nAMEs
  if (name.toLowerCase() !== name) {
    warnings.push('name can no longer contain capital letters')
  }

  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) {
    warnings.push('name can no longer contain special characters ("~\'!()*")')
  }

  if (encodeURIComponent(name) !== name) {
    // Maybe it's a scoped package name, like @user/package
    var nameMatch = name.match(scopedPackagePattern)
    if (nameMatch) {
      var user = nameMatch[1]
      var pkg = nameMatch[2]
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return done(warnings, errors)
      }
    }

    errors.push('name can only contain URL-friendly characters')
  }

  return done(warnings, errors)
}

var done = function (warnings, errors) {
  var result = {
    validForNewPackages: errors.length === 0 && warnings.length === 0,
    validForOldPackages: errors.length === 0,
    warnings: warnings,
    errors: errors,
  }
  if (!result.warnings.length) {
    delete result.warnings
  }
  if (!result.errors.length) {
    delete result.errors
  }
  return result
}

module.exports = validate


/***/ }),

/***/ 4091:
/***/ ((module) => {


module.exports = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value
    }
  }
}


/***/ }),

/***/ 665:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {


module.exports = Yallist

Yallist.Node = Node
Yallist.create = Yallist

function Yallist (list) {
  var self = this
  if (!(self instanceof Yallist)) {
    self = new Yallist()
  }

  self.tail = null
  self.head = null
  self.length = 0

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item)
    })
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i])
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next
  var prev = node.prev

  if (next) {
    next.prev = prev
  }

  if (prev) {
    prev.next = next
  }

  if (node === this.head) {
    this.head = next
  }
  if (node === this.tail) {
    this.tail = prev
  }

  node.list.length--
  node.next = null
  node.prev = null
  node.list = null

  return next
}

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var head = this.head
  node.list = this
  node.next = head
  if (head) {
    head.prev = node
  }

  this.head = node
  if (!this.tail) {
    this.tail = node
  }
  this.length++
}

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var tail = this.tail
  node.list = this
  node.prev = tail
  if (tail) {
    tail.next = node
  }

  this.tail = node
  if (!this.head) {
    this.head = node
  }
  this.length++
}

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value
  this.tail = this.tail.prev
  if (this.tail) {
    this.tail.next = null
  } else {
    this.head = null
  }
  this.length--
  return res
}

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value
  this.head = this.head.next
  if (this.head) {
    this.head.prev = null
  } else {
    this.tail = null
  }
  this.length--
  return res
}

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.next
  }
}

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.prev
  }
}

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.next
  }
  return res
}

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.prev
  }
  return res
}

Yallist.prototype.reduce = function (fn, initial) {
  var acc
  var walker = this.head
  if (arguments.length > 1) {
    acc = initial
  } else if (this.head) {
    walker = this.head.next
    acc = this.head.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i)
    walker = walker.next
  }

  return acc
}

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc
  var walker = this.tail
  if (arguments.length > 1) {
    acc = initial
  } else if (this.tail) {
    walker = this.tail.prev
    acc = this.tail.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i)
    walker = walker.prev
  }

  return acc
}

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.next
  }
  return arr
}

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.prev
  }
  return arr
}

Yallist.prototype.slice = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next
  }

  var ret = []
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value)
    walker = this.removeNode(walker)
  }
  if (walker === null) {
    walker = this.tail
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i])
  }
  return ret;
}

Yallist.prototype.reverse = function () {
  var head = this.head
  var tail = this.tail
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev
    walker.prev = walker.next
    walker.next = p
  }
  this.head = tail
  this.tail = head
  return this
}

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self)

  if (inserted.next === null) {
    self.tail = inserted
  }
  if (inserted.prev === null) {
    self.head = inserted
  }

  self.length++

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}

try {
  // add if support for Symbol.iterator is present
  __nccwpck_require__(4091)(Yallist)
} catch (er) {}


/***/ }),

/***/ 2081:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("child_process");

/***/ }),

/***/ 2361:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("path");

/***/ }),

/***/ 4521:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("readline");

/***/ }),

/***/ 3837:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("util");

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__nccwpck_require__.n = (module) => {
/******/ 		var getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__nccwpck_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

;// CONCATENATED MODULE: ./node_modules/chalk/source/vendor/ansi-styles/index.js
const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

const styles = {
	modifier: {
		reset: [0, 0],
		// 21 isn't widely supported and 22 does the same thing
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],

		// Bright color
		blackBright: [90, 39],
		gray: [90, 39], // Alias of `blackBright`
		grey: [90, 39], // Alias of `blackBright`
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],

		// Bright color
		bgBlackBright: [100, 49],
		bgGray: [100, 49], // Alias of `bgBlackBright`
		bgGrey: [100, 49], // Alias of `bgBlackBright`
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49],
	},
};

const modifierNames = Object.keys(styles.modifier);
const foregroundColorNames = Object.keys(styles.color);
const backgroundColorNames = Object.keys(styles.bgColor);
const colorNames = [...foregroundColorNames, ...backgroundColorNames];

function assembleStyles() {
	const codes = new Map();

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = wrapAnsi16();
	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value(red, green, blue) {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16
					+ (36 * Math.round(red / 255 * 5))
					+ (6 * Math.round(green / 255 * 5))
					+ Math.round(blue / 255 * 5);
			},
			enumerable: false,
		},
		hexToRgb: {
			value(hex) {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let [colorString] = matches;

				if (colorString.length === 3) {
					colorString = [...colorString].map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value(code) {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: hex => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles;
}

const ansiStyles = assembleStyles();

/* harmony default export */ const ansi_styles = (ansiStyles);

;// CONCATENATED MODULE: external "node:process"
const external_node_process_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:process");
;// CONCATENATED MODULE: external "node:os"
const external_node_os_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:os");
;// CONCATENATED MODULE: external "node:tty"
const external_node_tty_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:tty");
;// CONCATENATED MODULE: ./node_modules/chalk/source/vendor/supports-color/index.js




// From: https://github.com/sindresorhus/has-flag/blob/main/index.js
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : external_node_process_namespaceObject.argv) {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

const {env} = external_node_process_namespaceObject;

let flagForceColor;
if (
	hasFlag('no-color')
	|| hasFlag('no-colors')
	|| hasFlag('color=false')
	|| hasFlag('color=never')
) {
	flagForceColor = 0;
} else if (
	hasFlag('color')
	|| hasFlag('colors')
	|| hasFlag('color=true')
	|| hasFlag('color=always')
) {
	flagForceColor = 1;
}

function envForceColor() {
	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			return 1;
		}

		if (env.FORCE_COLOR === 'false') {
			return 0;
		}

		return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3,
	};
}

function _supportsColor(haveStream, {streamIsTTY, sniffFlags = true} = {}) {
	const noFlagForceColor = envForceColor();
	if (noFlagForceColor !== undefined) {
		flagForceColor = noFlagForceColor;
	}

	const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

	if (forceColor === 0) {
		return 0;
	}

	if (sniffFlags) {
		if (hasFlag('color=16m')
			|| hasFlag('color=full')
			|| hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}
	}

	// Check for Azure DevOps pipelines.
	// Has to be above the `!streamIsTTY` check.
	if ('TF_BUILD' in env && 'AGENT_NAME' in env) {
		return 1;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (external_node_process_namespaceObject.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = external_node_os_namespaceObject.release().split('.');
		if (
			Number(osRelease[0]) >= 10
			&& Number(osRelease[2]) >= 10_586
		) {
			return Number(osRelease[2]) >= 14_931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if ('GITHUB_ACTIONS' in env) {
			return 3;
		}

		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'BUILDKITE', 'DRONE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if (env.TERM === 'xterm-kitty') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = Number.parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app': {
				return version >= 3 ? 3 : 2;
			}

			case 'Apple_Terminal': {
				return 2;
			}
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function createSupportsColor(stream, options = {}) {
	const level = _supportsColor(stream, {
		streamIsTTY: stream && stream.isTTY,
		...options,
	});

	return translateLevel(level);
}

const supportsColor = {
	stdout: createSupportsColor({isTTY: external_node_tty_namespaceObject.isatty(1)}),
	stderr: createSupportsColor({isTTY: external_node_tty_namespaceObject.isatty(2)}),
};

/* harmony default export */ const supports_color = (supportsColor);

;// CONCATENATED MODULE: ./node_modules/chalk/source/utilities.js
// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string, substring, replacer) {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.slice(endIndex, index) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.slice(endIndex, (gotCR ? index - 1 : index)) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

;// CONCATENATED MODULE: ./node_modules/chalk/source/index.js




const {stdout: stdoutColor, stderr: stderrColor} = supports_color;

const GENERATOR = Symbol('GENERATOR');
const STYLER = Symbol('STYLER');
const IS_EMPTY = Symbol('IS_EMPTY');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m',
];

const source_styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class Chalk {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = (...strings) => strings.join(' ');
	applyOptions(chalk, options);

	Object.setPrototypeOf(chalk, createChalk.prototype);

	return chalk;
};

function createChalk(options) {
	return chalkFactory(options);
}

Object.setPrototypeOf(createChalk.prototype, Function.prototype);

for (const [styleName, style] of Object.entries(ansi_styles)) {
	source_styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		},
	};
}

source_styles.visible = {
	get() {
		const builder = createBuilder(this, this[STYLER], true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	},
};

const getModelAnsi = (model, level, type, ...arguments_) => {
	if (model === 'rgb') {
		if (level === 'ansi16m') {
			return ansi_styles[type].ansi16m(...arguments_);
		}

		if (level === 'ansi256') {
			return ansi_styles[type].ansi256(ansi_styles.rgbToAnsi256(...arguments_));
		}

		return ansi_styles[type].ansi(ansi_styles.rgbToAnsi(...arguments_));
	}

	if (model === 'hex') {
		return getModelAnsi('rgb', level, type, ...ansi_styles.hexToRgb(...arguments_));
	}

	return ansi_styles[type][model](...arguments_);
};

const usedModels = ['rgb', 'hex', 'ansi256'];

for (const model of usedModels) {
	source_styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...arguments_), ansi_styles.color.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	source_styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'bgColor', ...arguments_), ansi_styles.bgColor.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};
}

const proto = Object.defineProperties(() => {}, {
	...source_styles,
	level: {
		enumerable: true,
		get() {
			return this[GENERATOR].level;
		},
		set(level) {
			this[GENERATOR].level = level;
		},
	},
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent,
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	// Single argument is hot path, implicit coercion is faster than anything
	// eslint-disable-next-line no-implicit-coercion
	const builder = (...arguments_) => applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder[GENERATOR] = self;
	builder[STYLER] = _styler;
	builder[IS_EMPTY] = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self[IS_EMPTY] ? '' : string;
	}

	let styler = self[STYLER];

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.includes('\u001B')) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

Object.defineProperties(createChalk.prototype, source_styles);

const chalk = createChalk();
const chalkStderr = createChalk({level: stderrColor ? stderrColor.level : 0});





/* harmony default export */ const source = (chalk);

// EXTERNAL MODULE: ./node_modules/commander/index.js
var commander = __nccwpck_require__(1904);
var commander_default = /*#__PURE__*/__nccwpck_require__.n(commander);
;// CONCATENATED MODULE: ./package.json
const package_namespaceObject = JSON.parse('{"u2":"create-react-app","i8":"1.0.0"}');
;// CONCATENATED MODULE: ./helpers/get-pkg-manager.ts
function getPkgManager() {
    const userAgent = process.env.npm_config_user_agent;
    if (userAgent) {
        if (userAgent.startsWith("yarn")) {
            return "yarn";
        }
        else if (userAgent.startsWith("pnpm")) {
            return "pnpm";
        }
        else {
            return "npm";
        }
    }
    else {
        return "npm";
    }
}

// EXTERNAL MODULE: ./node_modules/prompts/index.js
var prompts = __nccwpck_require__(9646);
var prompts_default = /*#__PURE__*/__nccwpck_require__.n(prompts);
// EXTERNAL MODULE: ./node_modules/validate-npm-package-name/lib/index.js
var lib = __nccwpck_require__(4006);
var lib_default = /*#__PURE__*/__nccwpck_require__.n(lib);
;// CONCATENATED MODULE: ./helpers/validate-pkg.ts

function validateNpmName(name) {
    const nameValidation = lib_default()(name);
    if (nameValidation.validForNewPackages) {
        return { valid: true };
    }
    return {
        valid: false,
        problems: [
            ...(nameValidation.errors || []),
            ...(nameValidation.warnings || []),
        ],
    };
}

// EXTERNAL MODULE: external "path"
var external_path_ = __nccwpck_require__(1017);
var external_path_default = /*#__PURE__*/__nccwpck_require__.n(external_path_);
;// CONCATENATED MODULE: ./index.ts







let projectPath = "";
const handleSigTerm = () => process.exit(0);
process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);
const onPromptState = (state) => {
    if (state.aborted) {
        // If we don't re-enable the terminal cursor before exiting
        // the program, the cursor will remain hidden
        process.stdout.write("\x1B[?25h");
        process.stdout.write("\n");
        process.exit(1);
    }
};
const program = new (commander_default()).Command(package_namespaceObject.u2)
    .version(package_namespaceObject.i8)
    .arguments("<project-directory>")
    .usage(`${source.green("<project-directory>")} [options]`)
    .action((name) => {
    projectPath = name;
})
    .option("--ts, --typescript", `

  Initialize as a TypeScript project. (default)
`)
    .option("--js, --javascript", `

  Initialize as a JavaScript project.
`)
    .option("--tailwind", `

  Initialize with Tailwind CSS config. (default)
`)
    .option("--eslint", `

  Initialize with eslint config.
`)
    .option("--experimental-app", `

  Initialize as a \`app/\` directory project.
`)
    .option("--src-dir", `

  Initialize inside a \`src/\` directory.
`)
    .option("--import-alias <alias-to-configure>", `

  Specify import alias to use (default "@/*").
`)
    .option("--use-npm", `

  Explicitly tell the CLI to bootstrap the app using npm
`)
    .option("--use-pnpm", `

  Explicitly tell the CLI to bootstrap the app using pnpm
`)
    .option("-e, --example [name]|[github-url]", `

  An example to bootstrap the app with. You can use an example name
  from the official Next.js repo or a GitHub URL. The URL can use
  any branch and/or subdirectory
`)
    .option("--example-path <path-to-example>", `

  In a rare case, your GitHub URL might contain a branch name with
  a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar).
  In this case, you must specify the path to the example separately:
  --example-path foo/bar
`)
    .option("--reset-preferences", `

  Explicitly tell the CLI to reset any stored preferences
`)
    .allowUnknownOption()
    .parse(process.argv);
const packageManager = !!program.useNpm
    ? "npm"
    : !!program.usePnpm
        ? "pnpm"
        : getPkgManager();
async function run() {
    const conf = new Map([["projectName", "create-next-app"]]);
    if (program.resetPreferences) {
        conf.clear();
        console.log(`Preferences reset successfully`);
        return;
    }
    if (typeof projectPath === "string") {
        projectPath = projectPath.trim();
    }
    if (!projectPath) {
        const res = await prompts_default()({
            onState: onPromptState,
            type: "text",
            name: "path",
            message: "What is your project named?",
            initial: "my-app",
            validate: (name) => {
                const validation = validateNpmName(external_path_default().basename(external_path_default().resolve(name)));
                if (validation.valid) {
                    return true;
                }
                return "Invalid project name: " + validation.problems[0];
            },
        });
        if (typeof res.path === "string") {
            projectPath = res.path.trim();
        }
    }
    if (!projectPath) {
        console.log("\nPlease specify the project directory:\n" +
            `  ${source.cyan(program.name())} ${source.green("<project-directory>")}\n` +
            "For example:\n" +
            `  ${source.cyan(program.name())} ${source.green("my-next-app")}\n\n` +
            `Run ${source.cyan(`${program.name()} --help`)} to see all options.`);
        process.exit(1);
    }
    const resolvedProjectPath = external_path_default().resolve(projectPath);
    const projectName = external_path_default().basename(resolvedProjectPath);
    const { valid, problems } = validateNpmName(projectName);
    if (!valid) {
        console.error(`Could not create a project called ${source.red(`"${projectName}"`)} because of npm naming restrictions:`);
        problems.forEach((p) => console.error(`    ${source.red.bold("*")} ${p}`));
        process.exit(1);
    }
    /**
     * Verify the project dir is empty or doesn't exist
     */
}
run();

})();

