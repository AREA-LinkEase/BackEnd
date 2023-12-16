import { User } from './model/users.js';
import { Automate } from './model/automates.js'
import { Workspace } from './model/workspaces.js'

User.sync()
Automate.sync()
Workspace.sync()