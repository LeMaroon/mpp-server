/*
 This contains the configuration for most parts of the server, do not delete this file or the server will not be able 
 to operate.
 
 Some data in this file must be kept secret such as the salt and admin keys, exposing these can be dangerous.
*/

// === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === //
// General                                             // General category
var default_name = "Anonymous";                        // The name assigned to new users
var client_timeout_ms = 30000;                          // The amount of time (in milliseconds) that clients have to tell the server they're alive before being disconnected
var /**DONOTSHARE**/salt = process.env.TOKEN;                    // The 'salt' of each server user hash, changing this will change how user colors and _ids are generated
var /**DONOTSHARE**/evalKey = //process.env.evalKey;      // Eval key prefix for a message which will trigger a response where the server evaluates the code
                                                        // DO NOT SHARE THE SALT, IT CAN BE USED TO GET IP ADDRESSES OF USERS
// End General                                          // End of General category
// Spam protection                                      // Spam protection
// { none }                                             // No values
// End Spam protection                                  // End of spam protection
// === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === //
// DO NOT MODIFY
// BELOW THIS LINE
// === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === // === //

module.exports = { default_name, client_timeout_ms, salt, evalKey };