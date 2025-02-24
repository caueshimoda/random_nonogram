# Random Nonogram

[Play it here!](https://codepen.io/Cau-Shimoda/full/KwKMVJE)

[Nonogram](https://en.wikipedia.org/wiki/Nonogram) is a logic puzzle game where you must determine which squares should be filled based on the numbers along the edges of the grid.  

These numbers indicate how many consecutive squares should be filled in that row or column. If there are multiple numbers, it means there must be at least, but not necessarily, one empty square between each group.  

### Example:  
If a row is labeled **1 2 1**, it means:  
- One filled square  
- At least one empty square  
- Two adjacent filled squares  
- At least one empty square  
- One more filled square  

No other squares in that row should be filled.  

The numbers don’t tell you exactly where to start filling, but through logical deduction and the interaction between rows and columns, you can determine the correct placements.  

Normally, a Nonogram reveals a picture when completed. However, since **Random Nonogram** generates puzzles randomly, the final image won’t resemble anything specific.  

## Using the X  

The **X** is a helpful tool to mark squares that **cannot** be filled. This can assist in solving the puzzle logically. The game treats X-marked squares as empty, not filled.  

## Reveal Square  

If you have at least one **Reveal Square** available, you can use it to uncover the correct state of a chosen square. This feature is only available in **Medium** and **Hard** difficulties. Use it strategically to gain the most useful information.  

## Notes  

The code can be reused to generate Nonograms of different grid sizes. However, some style adjustments may be needed to properly fit the squares and numbers within the layout.  

