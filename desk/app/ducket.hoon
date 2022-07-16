::
::  push me - clicky, clicky
::
::  :push-me [%click ~] to click.
::
/+  *server, default-agent, dbug, agentio
::
|%
+$  versioned-state
  $%  state-0
  ==
::
+$  state-0  [%0 =which]
+$  card  card:agent:gall
+$  which  ?(%grid %park)
--
::
%-  agent:dbug
=|  state-0
=*  state  -
::
^-  agent:gall
::
|_  =bowl:gall
+*  this  .
    io    ~(. agentio bowl)
    pass  pass:io
    def   ~(. (default-agent this %|) bowl)
::
++  on-init
  ^-  (quip card _this)
  %-  (slog 'Welcome to Jurassic Park!' ~)
  :_  this(which %park)
  [(~(connect pass /eyre) [~ /] %ducket)]~
::
++  on-save
  %-  (slog 'on-save' ~)
  !>(state)
::
++  on-load
  |=  old=vase
  %-  (slog 'on-load' ~)
  ^-  (quip card _this)
  `this(state !<(state-0 old))
::
++  on-poke
  |=  [=mark =vase]
  %-  (slog 'on-poke' ~)
  ?>  (team:title our.bowl src.bowl)
  ^-  (quip card _this)
  ?+    mark  (on-poke:def mark vase)
      %noun
    =/  tap=[@ ~]  !<([@ ~] vase)  
    ?>  ?=(%click -.tap)
    =/  what=[@tas ?(%grid %park)]
      ?:(=(%park which) [%docket %grid] [%ducket %park])
    :_  this(which +.what)
    [(~(connect pass /eyre) [~ /] -.what)]~
  ::
      %handle-http-request
    ~&  >  'ducket-in-charge'
    =+  !<([id=@ta inbound-request:eyre] vase)
    =;  [payload=simple-payload:http]
      :_  this
      (give-simple-payload:app id payload)
    ?.  authenticated
      =-  [[307 ['location' -]~] ~]
      (cat 3 '/~/login?redirect=' url.request)
    =*  headers  header-list.request
    ?.  ?=(%'GET' method.request)  [405^~ ~]
    (redirect:gen '/apps/park/')
  ==
::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  %-  (slog 'on-arvo' ~)
  ?+    wire  (on-arvo:def wire sign)
      [%eyre ~]
    ?>  ?=([%eyre %bound *] sign)
    ?:  accepted.sign   `this
    ~&  [dap.bowl %failed-to-bind path.binding.sign]
    `this
  ==
++  on-watch
  |=  =path
  %-  (slog 'on-watch' ~)
  ^-  (quip card _this)
  ?.  ?=([%http-response *] path)  !!
  `this
++  on-leave  on-leave:def
++  on-peek   on-peek:def
++  on-agent  on-agent:def
++  on-fail   on-fail:def
--
