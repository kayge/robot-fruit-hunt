// board info
var board_height;
var board_width;
var types_of_fruit;

var fruit_counts;
var rare_fruit = 0;

// current goal
var target = [-1,-1];

// highest priority targets
var hitlist = [];

/* called at the beginning of a new game, probably a decent place to get 
 one-time info e.g. board size, fruit rarity/placement, etc
*/
function new_game() {
   var board = get_board();

   board_height = HEIGHT;
   board_width = WIDTH;

   types_of_fruit = get_number_of_item_types();
   fruit_counts = new Array(types_of_fruit+1);

   for (var i = 1; i < fruit_counts.length; i++) {
      fruit_counts[i] = get_total_item_count(i);

      if ((fruit_counts[i] > 0 && fruit_counts[i] < rare_fruit) || rare_fruit === 0){
         rare_fruit = i;
      }
   };


   find_rare_fruit();

   most_fruitful_quadrant();
}

function find_rare_fruit(){
   var board = get_board();

   // reset the rare
   rare_fruit = 0;

   board_height = HEIGHT;
   board_width = WIDTH;

   update_fruit_counts();

   for (var i = 1; i < fruit_counts.length; i++) {
      if ((fruit_counts[i] > 0 && fruit_counts[i] < rare_fruit) || rare_fruit === 0){
         rare_fruit = i;
      }
   };

   trace("The rarest fruit is " + rare_fruit);
   trace(fruit_counts);

   // scan the board for the rare fruit(s?)
   // todo : probably shouldn't assume there is only one
   for (var x = 0; x < board_width; x++){
      for (var y = 0; y < board_height; y++){
         if (board[x][y] === rare_fruit){
            target = [x,y];
            trace("My target is " + target);
            break;
         }
      }
   }
}

// go thru and check to see if bots have taken fruit
function update_fruit_counts() {
   for (var i = 1; i < fruit_counts.length; i++) {
      fruit_counts[i] = get_total_item_count(i)-(get_my_item_count(i)+get_opponent_item_count(i));
   };
}

// this is the main function called by the game server
function make_move() {
   var board = get_board();
   var my_x = get_my_x();
   var my_y = get_my_y();

   // we found an item! take it!
   if (board[my_x][my_y] > 0) {
      trace("Oooh, it's " + board[my_x][my_y])
      return TAKE;
   }

   // if RIGHT NEXT to a fruit, get it
   if (my_y - 1 >= 0 && board[my_x][my_y - 1] > 0) {
      trace("ERMAHGERD to the North!");
      return NORTH;
   }   if (my_x + 1 < board_width && board[my_x + 1][my_y] > 0) {
      trace("ERMAHGERD to the East!");
      return EAST;
   }
   if (my_x - 1 >= 0 && board[my_x - 1][my_y] > 0) {
      trace("ERMAHGERD to the West!");
      return WEST;
   }
   if (my_y + 1 < board_height && board[my_x][my_y + 1] > 0) {
      trace("ERMAHGERD to the South!");
      return SOUTH;
   }


   // otherwise, we're on a mission... of randomness
   if (target_still_exists(target)){
      return move_toward_target(target);
   }
   else {
      //target = get_new_target();
      trace("Getting a new target...");
      find_rare_fruit();
      return move_toward_target(target);
   }
}

// move in the direction of your target, but always be on the lookout for items
// in your path (that can be reached without adding extra moves)
function move_toward_target(target_coords) {
   var board = get_board();
   var my_x = get_my_x();
   var my_y = get_my_y();

   // target_coords has [x,y]
   if (my_x < target_coords[0]) {return EAST}
   else if (my_x > target_coords[0]) {return WEST}
   else if (my_y > target_coords[1]) {return NORTH}
   else if (my_y < target_coords[1]) {return SOUTH}


   // good ol' random bot
   // var rand = Math.random() * 4;

   // if (rand < 1) { 
   //    trace("heading north, boss");
   //    return NORTH;
   // }
   // if (rand < 2) {
   //    trace("heading south, boss");
   //    return SOUTH;
   // }
   // if (rand < 3) {
   //    trace("heading east, boss");
   //    return EAST;
   // }
   // else {
   //    trace("heading west, boss");
   //    return WEST;
   // }
}

// This should eventually get the next fruit on the
// rare fruit list (if still worthwhile, and if still exists)
function get_new_target() {

   //new_target = find_rare_fruit();

   find_rare_fruit();

   //trace("My target is now " + new_target);
   trace("My target is now " + target);

   //return new_target;
}

function target_still_exists(target_coords) {
   var board = get_board();

   trace(target_coords);

   if (board[target_coords[0]][target_coords[1]] > 0) {   
      trace("Target still exists");
      return true;
   }

   else {return false;}

}

// split the board into 4ths, figure out which has the most fruit
function most_fruitful_quadrant() {
   var board = get_board();
   var NW = 0;
   var NE = 0;
   var SW = 0;
   var SE = 0;

   var half_width = WIDTH / 2;
   var half_height = HEIGHT / 2;

   for (var x = 0; x < WIDTH; x++) {
      for (var y = 0; y < HEIGHT; y++) {
         if (board[x][y] > 0){
            if (x < half_width - 1 && y < half_height - 1) { NW += 1;}
            if (x > half_width - 1 && y < half_height - 1) { NE += 1;}
            if (x < half_width - 1 && y > half_height - 1) { SW += 1;}
            if (x > half_width - 1 && y > half_height - 1) { SE += 1;}
         }
      };            
   };   
   trace("NW has " + NW);
   trace("NE has " + NE);
   trace("SW has " + SW);
   trace("SE has " + SE);
}

// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
function default_board_number() {
   return 445381; // this is a fun, fruit-dense lvl
}

