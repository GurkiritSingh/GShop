import type { SupermarketBrand, PriceResult, ShoppingItem, StorePriceComparison } from '../types';

type PriceEntry = { price: number; productName: string };
type BrandPrices = Partial<Record<SupermarketBrand, PriceEntry>>;

// Helper: own-brand prices — big spread between budget and premium stores
function prices(
  base: number,
  name: string,
  opts?: {
    noAldi?: boolean; noLidl?: boolean; noWaitrose?: boolean;
    noCoop?: boolean; noMS?: boolean; noIceland?: boolean;
  }
): BrandPrices {
  const r = (n: number) => Math.round(n * 100) / 100;
  const result: BrandPrices = {
    // Big 4
    tesco:         { price: r(base),        productName: `Tesco ${name}` },
    asda:          { price: r(base * 0.94), productName: `ASDA ${name}` },
    sainsburys:    { price: r(base * 1.02), productName: `Sainsbury's ${name}` },
    morrisons:     { price: r(base * 0.97), productName: `Morrisons ${name}` },
    // Convenience / local
    spar:          { price: r(base * 1.15), productName: `Spar ${name}` },
    costcutter:    { price: r(base * 1.14), productName: `Costcutter ${name}` },
    nisa:          { price: r(base * 1.12), productName: `Nisa ${name}` },
    londis:        { price: r(base * 1.16), productName: `Londis ${name}` },
    budgens:       { price: r(base * 1.10), productName: `Budgens ${name}` },
    // Online
    ocado:         { price: r(base * 1.05), productName: `Ocado ${name}` },
    amazon_fresh:  { price: r(base * 1.0),  productName: `Amazon Fresh ${name}` },
  };
  // Discounters
  if (!opts?.noAldi)     result.aldi     = { price: r(base * 0.82), productName: `Aldi ${name}` };
  if (!opts?.noLidl)     result.lidl     = { price: r(base * 0.82), productName: `Lidl ${name}` };
  // Premium
  if (!opts?.noWaitrose) result.waitrose = { price: r(base * 1.18), productName: `Waitrose ${name}` };
  if (!opts?.noCoop)     result.coop     = { price: r(base * 1.08), productName: `Co-op ${name}` };
  if (!opts?.noMS)       result.marks_spencer = { price: r(base * 1.25), productName: `M&S ${name}` };
  // Frozen / discount
  if (!opts?.noIceland)  result.iceland  = { price: r(base * 0.95), productName: `Iceland ${name}` };
  result.farmfoods      = { price: r(base * 0.85), productName: `Farmfoods ${name}` };
  result.heron_foods    = { price: r(base * 0.88), productName: `Heron Foods ${name}` };
  result.home_bargains  = { price: r(base * 0.87), productName: `Home Bargains ${name}` };
  result.bm             = { price: r(base * 0.90), productName: `B&M ${name}` };
  result.poundland      = { price: r(base * 0.92), productName: `Poundland ${name}` };
  // Costco (bulk pricing — lower per unit but bigger packs)
  result.costco         = { price: r(base * 0.78), productName: `Kirkland/Costco ${name}` };
  return result;
}

// Helper: branded product prices — tighter spread, Aldi/Lidl usually don't stock
function branded(
  base: number,
  name: string,
  opts?: { hasAldi?: boolean; hasLidl?: boolean; hasIceland?: boolean }
): BrandPrices {
  const r = (n: number) => Math.round(n * 100) / 100;
  const result: BrandPrices = {
    // Big 4
    tesco:         { price: r(base),           productName: name },
    asda:          { price: r(base * 0.97),    productName: name },
    sainsburys:    { price: r(base * 1.0),     productName: name },
    morrisons:     { price: r(base * 0.98),    productName: name },
    // Premium
    waitrose:      { price: r(base * 1.0),     productName: name },
    coop:          { price: r(base * 1.05),    productName: name },
    marks_spencer: { price: r(base * 1.0),     productName: name },
    // Convenience
    spar:          { price: r(base * 1.08),    productName: name },
    costcutter:    { price: r(base * 1.07),    productName: name },
    nisa:          { price: r(base * 1.06),    productName: name },
    londis:        { price: r(base * 1.09),    productName: name },
    budgens:       { price: r(base * 1.04),    productName: name },
    // Online
    ocado:         { price: r(base * 1.0),     productName: name },
    amazon_fresh:  { price: r(base * 0.98),    productName: name },
    // Discount variety
    home_bargains: { price: r(base * 0.92),    productName: name },
    bm:            { price: r(base * 0.93),    productName: name },
    poundland:     { price: r(base * 0.95),    productName: name },
    // Costco (bulk)
    costco:        { price: r(base * 0.88),    productName: name },
  };
  if (opts?.hasAldi)    result.aldi    = { price: r(base * 0.95), productName: name };
  if (opts?.hasLidl)    result.lidl    = { price: r(base * 0.95), productName: name };
  if (opts?.hasIceland) result.iceland = { price: r(base * 0.98), productName: name };
  else                  result.iceland = { price: r(base * 0.99), productName: name };
  result.farmfoods     = { price: r(base * 0.90), productName: name };
  result.heron_foods   = { price: r(base * 0.92), productName: name };
  return result;
}

// ==================== PRICE DATABASE ====================
// ~150 common UK grocery items with realistic GBP prices
const PRICE_DATABASE: Record<string, BrandPrices> = {

  // ========== FRUIT & VEG ==========
  'bananas':         prices(0.75, 'Bananas Loose Bunch'),
  'apples':          prices(1.85, 'Gala Apples 6 Pack'),
  'oranges':         prices(1.80, 'Oranges 5 Pack'),
  'lemons':          prices(0.55, 'Lemons 3 Pack'),
  'limes':           prices(0.50, 'Limes 3 Pack'),
  'grapes':          prices(2.20, 'Seedless Grapes 500g'),
  'strawberries':    prices(2.50, 'Strawberries 400g'),
  'blueberries':     prices(2.75, 'Blueberries 150g'),
  'raspberries':     prices(2.50, 'Raspberries 150g'),
  'pears':           prices(1.70, 'Conference Pears 4 Pack'),
  'kiwi':            prices(1.00, 'Kiwi Fruit 4 Pack'),
  'mango':           prices(1.20, 'Mango Each'),
  'pineapple':       prices(1.50, 'Pineapple Each'),
  'melon':           prices(1.60, 'Cantaloupe Melon Each'),
  'watermelon':      prices(3.50, 'Watermelon Half'),
  'avocado':         prices(0.95, 'Ripe Avocado Each'),
  'tomatoes':        prices(0.69, 'Salad Tomatoes 6 Pack'),
  'cherry tomatoes': prices(1.10, 'Cherry Tomatoes 300g'),
  'potatoes':        prices(1.45, 'White Potatoes 2.5kg'),
  'sweet potatoes':  prices(1.20, 'Sweet Potatoes 1kg'),
  'onions':          prices(0.89, 'Brown Onions 1kg'),
  'red onion':       prices(0.85, 'Red Onions 3 Pack'),
  'spring onions':   prices(0.65, 'Spring Onions Bunch'),
  'carrots':         prices(0.55, 'Carrots 1kg'),
  'broccoli':        prices(0.75, 'Broccoli Head'),
  'cauliflower':     prices(1.00, 'Cauliflower Head'),
  'cabbage':         prices(0.70, 'White Cabbage Each'),
  'spinach':         prices(1.10, 'Baby Spinach 200g'),
  'lettuce':         prices(0.70, 'Iceberg Lettuce Each'),
  'cucumber':        prices(0.55, 'Cucumber Each'),
  'peppers':         prices(1.30, 'Mixed Peppers 3 Pack'),
  'mushrooms':       prices(0.85, 'Closed Cup Mushrooms 250g'),
  'courgette':       prices(0.60, 'Courgettes Each'),
  'aubergine':       prices(0.85, 'Aubergine Each'),
  'green beans':     prices(1.20, 'Fine Green Beans 200g'),
  'sweetcorn':       prices(1.00, 'Sweetcorn 2 Pack'),
  'peas':            prices(1.10, 'Garden Peas 300g'),
  'celery':          prices(0.65, 'Celery Heart'),
  'garlic':          prices(0.50, 'Garlic Bulb Each'),
  'ginger':          prices(0.65, 'Root Ginger Piece'),
  'chillies':        prices(0.55, 'Red Chillies 50g'),
  'parsnips':        prices(0.80, 'Parsnips 500g'),
  'swede':           prices(0.70, 'Swede Each'),
  'beetroot':        prices(0.85, 'Beetroot 4 Pack'),
  'leeks':           prices(0.75, 'Leeks 3 Pack'),
  'asparagus':       prices(2.25, 'Asparagus Tips 185g'),
  'salad':           prices(1.20, 'Mixed Salad Bag 120g'),
  'rocket':          prices(1.15, 'Rocket 80g'),
  'herbs':           prices(0.85, 'Fresh Coriander'),
  'basil':           prices(0.85, 'Fresh Basil Pot'),
  'corn on the cob': prices(1.00, 'Corn on the Cob 2 Pack'),

  // ========== MEAT & FISH ==========
  'chicken breast':    prices(3.75, 'Chicken Breast Fillets 300g'),
  'chicken thighs':    prices(2.85, 'Chicken Thigh Fillets 500g'),
  'whole chicken':     prices(4.25, 'Whole Chicken 1.5kg'),
  'chicken wings':     prices(2.50, 'Chicken Wings 1kg'),
  'chicken drumsticks':prices(2.20, 'Chicken Drumsticks 1kg'),
  'chicken nuggets':   prices(2.50, 'Chicken Nuggets 400g'),
  'turkey mince':      prices(3.20, 'Turkey Mince 500g'),
  'mince beef':        prices(3.39, 'Beef Mince 20% Fat 500g'),
  'lean mince':        prices(4.00, 'Lean Beef Mince 5% Fat 500g'),
  'steak':             prices(5.50, 'Sirloin Steak 225g'),
  'beef stewing':      prices(4.25, 'Beef Stewing Steak 400g'),
  'beef burgers':      prices(2.50, 'Beef Burgers 4 Pack'),
  'lamb chops':        prices(5.00, 'Lamb Chops 4 Pack'),
  'lamb mince':        prices(4.00, 'Lamb Mince 500g'),
  'lamb leg':          prices(8.50, 'Half Lamb Leg 1kg', { noAldi: true, noLidl: true }),
  'pork chops':        prices(3.25, 'Pork Chops 4 Pack'),
  'pork mince':        prices(2.75, 'Pork Mince 500g'),
  'pork belly':        prices(4.50, 'Pork Belly Slices 400g'),
  'gammon':            prices(3.50, 'Gammon Steaks 2 Pack'),
  'bacon':             prices(2.50, 'Smoked Back Bacon 300g'),
  'sausages':          prices(1.85, 'Pork Sausages 8 Pack'),
  'ham':               prices(2.20, 'Cooked Ham Slices 125g'),
  'salami':            prices(1.80, 'Salami Slices 100g'),
  'chorizo':           prices(2.00, 'Chorizo Slices 100g'),
  'pepperoni':         prices(1.80, 'Pepperoni Slices 100g'),
  'salmon':            prices(4.00, 'Salmon Fillets 2 Pack'),
  'cod':               prices(4.25, 'Cod Fillets 2 Pack'),
  'haddock':           prices(4.50, 'Haddock Fillets 2 Pack'),
  'prawns':            prices(3.75, 'King Prawns 200g'),
  'fish cakes':        prices(2.00, 'Fish Cakes 4 Pack'),
  'tuna steaks':       prices(4.50, 'Tuna Steaks 2 Pack'),
  'sardines':          prices(1.20, 'Sardines in Oil 120g'),
  'mackerel':          prices(2.00, 'Smoked Mackerel Fillets 170g'),

  // ========== DAIRY ==========
  'milk':              prices(1.55, 'Semi Skimmed Milk 2.27L'),
  'whole milk':        prices(1.55, 'Whole Milk 2.27L'),
  'skimmed milk':      prices(1.55, 'Skimmed Milk 2.27L'),
  'oat milk':          prices(1.80, 'Oat Drink 1L'),
  'almond milk':       prices(1.70, 'Almond Drink 1L'),
  'soy milk':          prices(1.15, 'Soy Drink 1L'),
  'eggs':              prices(1.85, 'Free Range Eggs 10 Pack'),
  'cheese':            prices(2.85, 'Mature Cheddar 400g'),
  'mild cheddar':      prices(2.65, 'Mild Cheddar 400g'),
  'mozzarella':        prices(0.85, 'Mozzarella 125g'),
  'parmesan':          prices(2.50, 'Parmesan 100g', { noAldi: true, noLidl: true }),
  'brie':              prices(1.80, 'Brie 200g'),
  'cream cheese':      prices(1.35, 'Cream Cheese 200g'),
  'feta':              prices(1.65, 'Feta 200g'),
  'halloumi':          prices(2.50, 'Halloumi 225g'),
  'grated cheese':     prices(2.30, 'Grated Mature Cheddar 250g'),
  'cheese slices':     prices(1.60, 'Cheese Slices 10 Pack'),
  'butter':            prices(2.25, 'British Butter 250g'),
  'margarine':         prices(1.25, 'Spread 500g'),
  'double cream':      prices(1.65, 'Double Cream 300ml'),
  'single cream':      prices(0.95, 'Single Cream 300ml'),
  'sour cream':        prices(0.90, 'Sour Cream 300ml'),
  'creme fraiche':     prices(1.10, 'Creme Fraiche 300ml'),
  'yoghurt':           prices(1.10, 'Greek Style Yoghurt 500g'),
  'fruit yoghurt':     prices(1.50, 'Fruit Yoghurt 4 Pack'),
  'custard':           prices(1.10, 'Ready to Serve Custard 500g'),

  // ========== BAKERY ==========
  'bread':             prices(1.10, 'Medium White Bread 800g'),
  'wholemeal bread':   prices(1.15, 'Wholemeal Bread 800g'),
  'brown bread':       prices(1.15, 'Medium Brown Bread 800g'),
  'sourdough':         prices(1.80, 'Sourdough Loaf 400g'),
  'rolls':             prices(0.85, 'White Rolls 6 Pack'),
  'wraps':             prices(1.15, 'Plain Tortilla Wraps 8 Pack'),
  'pitta bread':       prices(0.65, 'White Pitta Bread 6 Pack'),
  'naan bread':        prices(1.00, 'Plain Naan Bread 2 Pack'),
  'bagels':            prices(1.10, 'Plain Bagels 5 Pack'),
  'crumpets':          prices(0.80, 'Crumpets 6 Pack'),
  'english muffins':   prices(0.80, 'English Muffins 4 Pack'),
  'croissants':        prices(1.35, 'Butter Croissants 4 Pack'),
  'brioche':           prices(1.50, 'Brioche Rolls 6 Pack'),
  'hot dog buns':      prices(0.75, 'Hot Dog Rolls 6 Pack'),
  'burger buns':       prices(0.80, 'Burger Buns 6 Pack'),
  'pancakes':          prices(1.20, 'Scotch Pancakes 6 Pack'),
  'scones':            prices(1.25, 'Fruit Scones 4 Pack'),
  'garlic bread':      prices(1.10, 'Garlic Bread Baguette'),
  'breadsticks':       prices(1.00, 'Breadsticks 125g'),
  'cake':              prices(2.50, 'Madeira Cake'),
  'doughnuts':         prices(1.20, 'Ring Doughnuts 5 Pack'),
  'muffins':           prices(1.50, 'Chocolate Muffins 4 Pack'),

  // ========== DRINKS ==========
  'tea':               prices(2.65, '80 Tea Bags'),
  'coffee':            prices(3.85, 'Instant Coffee 200g'),
  'ground coffee':     prices(3.50, 'Ground Coffee 227g'),
  'hot chocolate':     prices(2.50, 'Hot Chocolate 300g'),
  'orange juice':      prices(1.75, 'Orange Juice 1L'),
  'apple juice':       prices(1.60, 'Apple Juice 1L'),
  'cranberry juice':   prices(2.00, 'Cranberry Juice 1L'),
  'squash':            prices(1.25, 'Orange Squash 750ml'),
  'cola':              prices(1.15, 'Cola 2L'),
  'lemonade':          prices(0.65, 'Lemonade 2L'),
  'sparkling water':   prices(0.45, 'Sparkling Water 2L'),
  'still water':       prices(0.40, 'Still Water 2L'),
  'energy drink':      prices(1.30, 'Energy Drink 500ml', { noAldi: true, noLidl: true }),
  'tonic water':       prices(0.85, 'Tonic Water 1L'),
  'beer':              prices(4.50, 'Lager 4x440ml'),
  'cider':             prices(4.25, 'Cider 4x440ml'),
  'wine':              prices(5.50, 'Red Wine 75cl', { noAldi: false, noLidl: false }),
  'prosecco':          prices(7.50, 'Prosecco 75cl'),
  'gin':               prices(16.00, 'London Dry Gin 70cl', { noAldi: true, noLidl: true }),
  'vodka':             prices(15.00, 'Vodka 70cl', { noAldi: true, noLidl: true }),
  'whisky':            prices(16.00, 'Blended Scotch Whisky 70cl', { noAldi: true, noLidl: true }),
  'rum':               prices(14.00, 'Dark Rum 70cl', { noAldi: true, noLidl: true }),

  // ========== SNACKS ==========
  'crisps':            prices(1.75, 'Ready Salted Crisps 6 Pack'),
  'multipack crisps':  prices(2.50, 'Variety Crisps 12 Pack'),
  'tortilla chips':    prices(1.50, 'Tortilla Chips 200g'),
  'popcorn':           prices(1.30, 'Sweet Popcorn 100g'),
  'nuts':              prices(2.00, 'Mixed Nuts 200g'),
  'peanuts':           prices(1.50, 'Dry Roasted Peanuts 200g'),
  'cashews':           prices(2.75, 'Cashew Nuts 150g'),
  'chocolate':         prices(1.25, 'Milk Chocolate Bar 200g'),
  'dark chocolate':    prices(1.35, 'Dark Chocolate Bar 200g'),
  'chocolate bar':     prices(0.75, 'Chocolate Bar 40g'),
  'biscuits':          prices(0.85, 'Rich Tea Biscuits 300g'),
  'digestives':        prices(0.95, 'Digestive Biscuits 400g'),
  'chocolate biscuits':prices(1.15, 'Chocolate Digestives 300g'),
  'hobnobs':           prices(1.25, 'Hobnobs 300g'),
  'custard creams':    prices(0.55, 'Custard Cream Biscuits 400g'),
  'bourbons':          prices(0.55, 'Bourbon Biscuits 400g'),
  'crackers':          prices(1.10, 'Cream Crackers 300g'),
  'rice cakes':        prices(1.00, 'Rice Cakes 130g'),
  'cereal bars':       prices(1.50, 'Cereal Bars 6 Pack'),
  'flapjacks':         prices(1.25, 'Flapjack Bites 5 Pack'),
  'sweets':            prices(1.00, 'Fruit Pastilles 143g'),
  'haribo':            prices(1.25, 'Haribo Tangfastics 160g'),
  'dried fruit':       prices(2.00, 'Mixed Dried Fruit 500g'),
  'raisins':           prices(1.50, 'Raisins 500g'),
  'trail mix':         prices(2.50, 'Trail Mix 200g'),
  'hummus':            prices(1.20, 'Hummus 200g'),
  'dips':              prices(1.50, 'Sour Cream & Chive Dip 200g'),
  'olives':            prices(1.50, 'Pitted Green Olives 160g'),

  // ========== HOUSEHOLD ==========
  'toilet roll':       prices(3.25, 'Toilet Tissue 9 Rolls'),
  'kitchen roll':      prices(1.80, 'Kitchen Towel 2 Rolls'),
  'bin bags':          prices(1.50, 'Bin Bags 20 Pack'),
  'cling film':        prices(1.25, 'Cling Film 30m'),
  'tin foil':          prices(1.40, 'Aluminium Foil 10m'),
  'baking paper':      prices(1.30, 'Baking Parchment 10m'),
  'washing up liquid':  prices(0.89, 'Washing Up Liquid 450ml'),
  'bleach':            prices(0.70, 'Thick Bleach 750ml'),
  'all purpose cleaner':prices(1.15, 'All Purpose Cleaner 750ml'),
  'laundry detergent': prices(4.50, 'Laundry Liquid 30 Wash'),
  'fabric softener':   prices(2.00, 'Fabric Conditioner 1.5L'),
  'dishwasher tablets':prices(3.50, 'Dishwasher Tablets 30 Pack'),
  'hand soap':         prices(0.85, 'Handwash 250ml'),
  'shower gel':        prices(1.00, 'Shower Gel 250ml'),
  'shampoo':           prices(1.25, 'Shampoo 400ml'),
  'conditioner':       prices(1.25, 'Conditioner 400ml'),
  'toothpaste':        prices(1.00, 'Toothpaste 100ml'),
  'toothbrush':        prices(1.00, 'Toothbrush Each'),
  'deodorant':         prices(1.50, 'Antiperspirant 250ml'),
  'tissues':           prices(0.95, 'Facial Tissues Box'),
  'nappies':           prices(4.50, 'Nappies 40 Pack'),
  'baby wipes':        prices(1.00, 'Baby Wipes 60 Pack'),
  'sponges':           prices(0.75, 'Scouring Sponges 4 Pack'),

  // ========== TINNED & CANNED ==========
  'baked beans':       prices(0.75, 'Baked Beans 400g'),
  'chopped tomatoes':  prices(0.55, 'Chopped Tomatoes 400g'),
  'tuna':              prices(1.10, 'Tuna Chunks in Brine 145g'),
  'soup':              prices(1.10, 'Tomato Soup 400g'),
  'chicken soup':      prices(1.15, 'Chicken Soup 400g'),
  'tinned sweetcorn':  prices(0.65, 'Sweetcorn 198g'),
  'kidney beans':      prices(0.55, 'Red Kidney Beans 400g'),
  'chickpeas':         prices(0.55, 'Chickpeas 400g'),
  'black beans':       prices(0.60, 'Black Beans 400g'),
  'butter beans':      prices(0.60, 'Butter Beans 400g'),
  'lentils':           prices(0.60, 'Green Lentils 400g'),
  'coconut milk':      prices(0.95, 'Coconut Milk 400ml'),
  'tinned fruit':      prices(1.00, 'Peach Slices 410g'),
  'corned beef':       prices(2.50, 'Corned Beef 340g'),
  'spam':              prices(2.75, 'Chopped Pork 340g'),
  'spaghetti':         prices(0.55, 'Spaghetti in Tomato Sauce 400g'),
  'tinned tomatoes':   prices(0.55, 'Plum Tomatoes 400g'),
  'tomato puree':      prices(0.60, 'Tomato Puree 200g'),
  'passata':           prices(0.70, 'Passata 500g'),

  // ========== FROZEN ==========
  'fish fingers':      prices(2.10, '10 Fish Fingers 250g'),
  'pizza':             prices(1.85, 'Stonebaked Margherita Pizza'),
  'pepperoni pizza':   prices(2.25, 'Stonebaked Pepperoni Pizza'),
  'chips':             prices(1.65, 'Straight Cut Chips 900g'),
  'wedges':            prices(1.75, 'Potato Wedges 750g'),
  'waffles':           prices(1.20, 'Potato Waffles 8 Pack'),
  'ice cream':         prices(2.50, 'Vanilla Ice Cream 900ml'),
  'ice lollies':       prices(1.75, 'Fruit Ice Lollies 6 Pack'),
  'frozen peas':       prices(1.00, 'Garden Peas 900g'),
  'frozen sweetcorn':  prices(1.00, 'Sweetcorn 900g'),
  'frozen berries':    prices(2.50, 'Mixed Berries 350g'),
  'frozen veg':        prices(1.10, 'Mixed Vegetables 900g'),
  'frozen prawns':     prices(4.00, 'Raw King Prawns 250g'),
  'chicken kievs':     prices(2.25, 'Chicken Kievs 2 Pack'),
  'nuggets':           prices(2.50, 'Chicken Nuggets 400g'),
  'frozen burgers':    prices(2.00, 'Beef Burgers 4 Pack'),
  'frozen sausages':   prices(2.25, 'Pork Sausages 12 Pack'),
  'yorkshire puddings':prices(1.00, 'Yorkshire Puddings 12 Pack'),
  'frozen garlic bread':prices(1.10, 'Garlic Bread Baguette'),
  'frozen meals':      prices(2.00, 'Lasagne 400g'),

  // ========== PASTA, RICE & STAPLES ==========
  'pasta':             prices(0.70, 'Penne Pasta 500g'),
  'spaghetti pasta':   prices(0.70, 'Spaghetti 500g'),
  'fusilli':           prices(0.70, 'Fusilli Pasta 500g'),
  'tagliatelle':       prices(0.75, 'Tagliatelle 500g'),
  'lasagne sheets':    prices(0.85, 'Lasagne Sheets 375g'),
  'noodles':           prices(0.70, 'Egg Noodles 250g'),
  'instant noodles':   prices(0.25, 'Instant Noodles'),
  'rice':              prices(1.45, 'Long Grain Rice 1kg'),
  'basmati rice':      prices(2.00, 'Basmati Rice 1kg'),
  'brown rice':        prices(1.60, 'Brown Rice 1kg'),
  'microwave rice':    prices(1.10, 'Microwave Basmati Rice 250g'),
  'couscous':          prices(1.00, 'Couscous 500g'),
  'quinoa':            prices(2.50, 'Quinoa 300g'),
  'cereal':            prices(2.15, 'Cornflakes 500g'),
  'porridge oats':     prices(1.50, 'Porridge Oats 1kg'),
  'muesli':            prices(2.25, 'Muesli 750g'),
  'granola':           prices(2.75, 'Granola 500g'),
  'flour':             prices(0.85, 'Plain Flour 1.5kg'),
  'self raising flour':prices(0.85, 'Self Raising Flour 1.5kg'),
  'bread flour':       prices(1.40, 'Strong Bread Flour 1.5kg'),
  'sugar':             prices(1.05, 'Granulated Sugar 1kg'),
  'caster sugar':      prices(1.10, 'Caster Sugar 1kg'),
  'brown sugar':       prices(1.15, 'Soft Brown Sugar 500g'),
  'icing sugar':       prices(1.00, 'Icing Sugar 500g'),
  'honey':             prices(3.00, 'Clear Honey 340g'),
  'golden syrup':      prices(1.50, 'Golden Syrup 454g'),
  'maple syrup':       prices(3.50, 'Maple Syrup 250ml', { noAldi: true, noLidl: true }),

  // ========== COOKING & CONDIMENTS ==========
  'cooking oil':       prices(2.00, 'Vegetable Oil 1L'),
  'olive oil':         prices(3.50, 'Olive Oil 500ml'),
  'extra virgin olive oil': prices(4.50, 'Extra Virgin Olive Oil 500ml'),
  'sunflower oil':     prices(1.90, 'Sunflower Oil 1L'),
  'coconut oil':       prices(3.00, 'Coconut Oil 300ml'),
  'vinegar':           prices(0.65, 'White Wine Vinegar 350ml'),
  'balsamic vinegar':  prices(1.50, 'Balsamic Vinegar 250ml'),
  'soy sauce':         prices(1.20, 'Soy Sauce 150ml'),
  'ketchup':           prices(1.80, 'Tomato Ketchup 460g'),
  'mayonnaise':        prices(1.85, 'Mayonnaise 400ml'),
  'mustard':           prices(1.00, 'English Mustard 180g'),
  'brown sauce':       prices(1.50, 'Brown Sauce 450g'),
  'hot sauce':         prices(2.00, 'Hot Chilli Sauce 150ml'),
  'worcestershire sauce': prices(1.60, 'Worcestershire Sauce 150ml'),
  'bbq sauce':         prices(1.25, 'BBQ Sauce 480g'),
  'salad cream':       prices(1.30, 'Salad Cream 285ml'),
  'jam':               prices(1.50, 'Strawberry Jam 454g'),
  'marmalade':         prices(1.50, 'Orange Marmalade 454g'),
  'peanut butter':     prices(2.00, 'Peanut Butter Crunchy 340g'),
  'chocolate spread':  prices(3.50, 'Chocolate Spread 400g'),
  'marmite':           prices(3.25, 'Marmite 250g'),
  'stock cubes':       prices(0.95, 'Chicken Stock Cubes 10 Pack'),
  'gravy granules':    prices(1.25, 'Gravy Granules 200g'),
  'salt':              prices(0.65, 'Table Salt 750g'),
  'pepper':            prices(1.20, 'Ground Black Pepper 100g'),
  'mixed herbs':       prices(0.85, 'Mixed Herbs 12g'),
  'paprika':           prices(0.95, 'Paprika 46g'),
  'cumin':             prices(0.95, 'Ground Cumin 35g'),
  'chilli powder':     prices(0.95, 'Chilli Powder 40g'),
  'turmeric':          prices(0.95, 'Ground Turmeric 50g'),
  'cinnamon':          prices(0.95, 'Ground Cinnamon 40g'),
  'curry powder':      prices(1.10, 'Curry Powder 80g'),
  'curry paste':       prices(1.50, 'Korma Curry Paste 270g'),
  'tikka paste':       prices(1.50, 'Tikka Masala Paste 270g'),
  'pasta sauce':       prices(1.20, 'Tomato & Basil Pasta Sauce 500g'),
  'pesto':             prices(1.50, 'Green Pesto 190g'),
  'stir fry sauce':    prices(1.40, 'Sweet Chilli Stir Fry Sauce 250ml'),
  'chutney':           prices(1.50, 'Mango Chutney 320g'),
  'pickles':           prices(1.20, 'Pickle 280g'),
  'olives jar':        prices(1.50, 'Pitted Green Olives 340g'),
  'capers':            prices(1.30, 'Capers 200g', { noAldi: true, noLidl: true }),

  // ========== READY MEALS & PREPARED ==========
  'ready meal':        prices(2.50, 'Chicken Tikka Masala with Rice 400g'),
  'sandwiches':        prices(2.00, 'BLT Sandwich', { noAldi: true, noLidl: true }),
  'sushi':             prices(3.50, 'Sushi Selection 10 Piece', { noAldi: true, noLidl: true }),
  'scotch eggs':       prices(1.80, 'Scotch Eggs 4 Pack'),
  'sausage rolls':     prices(1.50, 'Sausage Rolls 4 Pack'),
  'pork pies':         prices(1.75, 'Pork Pie 4 Pack'),
  'quiche':            prices(2.25, 'Quiche Lorraine 400g'),
  'coleslaw':          prices(1.00, 'Coleslaw 300g'),
  'potato salad':      prices(1.10, 'Potato Salad 300g'),
  'meal deal':         prices(3.50, 'Meal Deal', { noAldi: true, noLidl: true }),

  // ========== BAKING ==========
  'baking powder':     prices(0.85, 'Baking Powder 170g'),
  'bicarbonate of soda': prices(0.75, 'Bicarbonate of Soda 200g'),
  'vanilla extract':   prices(2.00, 'Vanilla Extract 38ml'),
  'cocoa powder':      prices(1.50, 'Cocoa Powder 250g'),
  'chocolate chips':   prices(1.75, 'Chocolate Chips 100g'),
  'dried yeast':       prices(1.00, 'Fast Action Dried Yeast 56g'),
  'cornflour':         prices(0.75, 'Cornflour 250g'),
  'food colouring':    prices(1.50, 'Food Colouring Set'),

  // ========== BABY & KIDS ==========
  'baby food':         prices(0.85, 'Baby Food Pouch 100g'),
  'baby formula':      prices(12.00, 'First Infant Milk 800g', { noAldi: true, noLidl: true }),
  'kids yoghurt':      prices(1.50, 'Kids Yoghurt Tubes 6 Pack'),

  // ========== PET FOOD ==========
  'cat food':          prices(3.50, 'Cat Food Pouches 12 Pack'),
  'dog food':          prices(4.00, 'Dog Food Tins 6 Pack'),
  'cat treats':        prices(1.50, 'Cat Treats 60g'),
  'dog treats':        prices(2.00, 'Dog Treats 180g'),

  // ================================================================
  //  BRANDED PRODUCTS
  // ================================================================

  // ===== BRANDED: Baked Beans & Tinned =====
  'heinz baked beans':       branded(1.20, 'Heinz Beanz 415g', { hasIceland: true }),
  'heinz beans':             branded(1.20, 'Heinz Beanz 415g', { hasIceland: true }),
  'branston beans':          branded(0.90, 'Branston Baked Beans 410g', { hasIceland: true }),
  'heinz tomato soup':       branded(1.40, 'Heinz Cream of Tomato Soup 400g', { hasIceland: true }),
  'heinz chicken soup':      branded(1.40, 'Heinz Cream of Chicken Soup 400g'),
  'heinz spaghetti':         branded(1.20, 'Heinz Spaghetti 400g', { hasIceland: true }),
  'heinz spaghetti hoops':   branded(1.10, 'Heinz Spaghetti Hoops 400g', { hasIceland: true }),
  'heinz chopped tomatoes':  branded(1.10, 'Heinz Chopped Tomatoes 400g'),
  'napolina chopped tomatoes':branded(0.95, 'Napolina Chopped Tomatoes 400g'),
  'john west tuna':          branded(1.75, 'John West Tuna Chunks in Brine 145g'),
  'princes tuna':            branded(1.50, 'Princes Tuna Chunks in Brine 145g', { hasIceland: true }),
  'ambrosia custard':        branded(1.50, 'Ambrosia Devon Custard 400g'),
  'ambrosia rice pudding':   branded(1.30, 'Ambrosia Creamed Rice 400g'),
  'baxters soup':            branded(1.85, 'Baxters Favourites Soup 400g'),

  // ===== BRANDED: Sauces & Condiments =====
  'heinz ketchup':           branded(3.50, 'Heinz Tomato Ketchup 460g', { hasIceland: true }),
  'heinz mayo':              branded(2.80, 'Heinz Seriously Good Mayonnaise 480ml'),
  'heinz salad cream':       branded(2.20, 'Heinz Salad Cream 285ml'),
  'hellmanns mayo':          branded(2.95, "Hellmann's Real Mayonnaise 400ml"),
  'hellmanns mayonnaise':    branded(2.95, "Hellmann's Real Mayonnaise 400ml"),
  'hp sauce':                branded(2.50, 'HP Original Brown Sauce 450g'),
  'hp brown sauce':          branded(2.50, 'HP Original Brown Sauce 450g'),
  'colmans mustard':         branded(2.20, "Colman's English Mustard 170g"),
  'french mustard':          branded(1.50, "Colman's French Mustard 185g"),
  'lea & perrins':           branded(2.50, 'Lea & Perrins Worcestershire Sauce 150ml'),
  'tabasco':                 branded(3.00, 'Tabasco Pepper Sauce 60ml'),
  'sriracha':                branded(3.25, 'Flying Goose Sriracha 455ml'),
  'nandos sauce':            branded(2.75, "Nando's Peri Peri Sauce 250ml"),
  'dolmio sauce':            branded(2.00, 'Dolmio Bolognese Sauce 500g', { hasIceland: true }),
  'dolmio':                  branded(2.00, 'Dolmio Bolognese Sauce 500g', { hasIceland: true }),
  'loyd grossman sauce':     branded(2.25, 'Loyd Grossman Tomato & Basil Sauce 350g'),
  'sacla pesto':             branded(2.50, "Sacla' Classic Basil Pesto 190g"),
  'patak paste':             branded(1.90, "Patak's Tikka Masala Paste 283g", { hasIceland: true }),
  'sharwoods sauce':         branded(1.85, "Sharwood's Sweet & Sour Sauce 425g"),
  'blue dragon':             branded(1.80, 'Blue Dragon Sweet Chilli Sauce 190ml'),
  'bisto gravy':             branded(2.50, 'Bisto Original Gravy Granules 190g', { hasIceland: true }),
  'oxo cubes':               branded(1.85, 'OXO Beef Stock Cubes 12 Pack'),
  'knorr stock pots':        branded(2.00, 'Knorr Stock Pots 4 Pack'),
  // marmite is in own-brand section already
  'bovril':                  branded(3.50, 'Bovril Beef Extract 250g'),

  // ===== BRANDED: Spreads & Breakfast =====
  'lurpak':                  branded(4.25, 'Lurpak Spreadable 250g', { hasIceland: true }),
  'lurpak butter':           branded(3.75, 'Lurpak Butter 250g', { hasIceland: true }),
  'anchor butter':           branded(2.65, 'Anchor Butter 250g'),
  'anchor spread':           branded(2.85, 'Anchor Spreadable 500g'),
  'flora':                   branded(2.30, 'Flora Original 500g'),
  'flora spread':            branded(2.30, 'Flora Original 500g'),
  'clover':                  branded(2.50, 'Clover Spread 500g'),
  'country life butter':     branded(2.60, 'Country Life Butter 250g'),
  'nutella':                 branded(3.50, 'Nutella Hazelnut Spread 400g', { hasIceland: true }),
  'sun-pat peanut butter':   branded(3.00, 'Sun-Pat Crunchy Peanut Butter 340g'),
  'hartleys jam':            branded(1.85, "Hartley's Strawberry Jam 340g"),
  'robertsons marmalade':    branded(2.00, "Robertson's Golden Shred Marmalade 454g"),
  'philadelphia':            branded(2.25, 'Philadelphia Original 180g'),
  'dairylea':                branded(2.00, 'Dairylea Triangles 8 Pack', { hasIceland: true }),
  'babybel':                 branded(2.50, 'Mini Babybel 6 Pack'),
  'cathedral city':          branded(4.00, 'Cathedral City Mature Cheddar 350g'),
  'cathedral city cheese':   branded(4.00, 'Cathedral City Mature Cheddar 350g'),
  'pilgrim choice':          branded(3.25, "Pilgrims Choice Mature Cheddar 350g"),
  'seriously strong':        branded(3.50, 'Seriously Strong Mature Cheddar 300g'),

  // ===== BRANDED: Bread & Bakery =====
  'warburtons':              branded(1.55, 'Warburtons Toastie White 800g'),
  'warburtons bread':        branded(1.55, 'Warburtons Toastie White 800g'),
  'warburtons thins':        branded(1.50, 'Warburtons Sandwich Thins 6 Pack'),
  'hovis':                   branded(1.50, 'Hovis Soft White Medium 800g'),
  'hovis bread':             branded(1.50, 'Hovis Soft White Medium 800g'),
  'hovis best of both':      branded(1.55, 'Hovis Best of Both Medium 750g'),
  'kingsmill':               branded(1.30, 'Kingsmill Soft White Medium 800g'),
  'kingsmill bread':         branded(1.30, 'Kingsmill Soft White Medium 800g'),
  'roberts bread':           branded(1.40, 'Roberts Medium White 800g'),
  'new york bakery bagels':  branded(2.00, 'New York Bakery Co. Plain Bagels 5 Pack'),
  'old el paso wraps':       branded(2.00, 'Old El Paso Tortilla Wraps 8 Pack'),
  'old el paso kit':         branded(3.50, 'Old El Paso Fajita Kit 500g', { hasIceland: true }),
  'mr kipling':              branded(2.50, 'Mr Kipling Exceedingly Good Cakes 6 Pack'),
  'mr kipling cakes':        branded(2.50, 'Mr Kipling French Fancies 8 Pack'),
  'mcvities jaffa cakes':    branded(1.50, "McVitie's Jaffa Cakes 10 Pack"),

  // ===== BRANDED: Cereals =====
  'kelloggs cornflakes':     branded(3.25, "Kellogg's Corn Flakes 500g", { hasIceland: true }),
  'kelloggs':                branded(3.25, "Kellogg's Corn Flakes 500g", { hasIceland: true }),
  'kelloggs crunchy nut':    branded(3.65, "Kellogg's Crunchy Nut 500g"),
  'kelloggs special k':      branded(3.75, "Kellogg's Special K 500g"),
  'coco pops':               branded(3.50, "Kellogg's Coco Pops 480g", { hasIceland: true }),
  'rice krispies':           branded(3.25, "Kellogg's Rice Krispies 510g"),
  'frosties':                branded(3.25, "Kellogg's Frosties 500g", { hasIceland: true }),
  'weetabix':                branded(3.50, 'Weetabix 24 Pack'),
  'weetabix cereal':         branded(3.50, 'Weetabix 24 Pack'),
  'shreddies':               branded(3.25, 'Nestlé Shreddies Original 460g'),
  'cheerios':                branded(3.25, 'Nestlé Cheerios 390g'),
  'shredded wheat':          branded(3.00, 'Nestlé Shredded Wheat 16 Pack'),
  'quaker oats':             branded(2.75, 'Quaker Oats Porridge 1kg'),
  'quaker porridge':         branded(2.75, 'Quaker Oats Porridge 1kg'),
  'ready brek':              branded(2.50, 'Ready Brek Original 450g'),
  'alpen':                   branded(3.50, 'Alpen Original Muesli 550g'),
  'jordans granola':         branded(3.75, 'Jordans Crunchy Granola 500g'),

  // ===== BRANDED: Tea & Coffee =====
  'pg tips':                 branded(3.50, 'PG Tips 80 Tea Bags'),
  'yorkshire tea':           branded(3.75, 'Yorkshire Tea 80 Tea Bags'),
  'tetley':                  branded(3.25, 'Tetley 80 Tea Bags'),
  'typhoo':                  branded(3.00, 'Typhoo 80 Tea Bags'),
  'twinings':                branded(2.75, 'Twinings English Breakfast 50 Tea Bags'),
  'twinings earl grey':      branded(2.75, 'Twinings Earl Grey 50 Tea Bags'),
  'clipper tea':             branded(3.00, 'Clipper Organic Everyday Tea 80 Bags'),
  'nescafe':                 branded(5.50, 'Nescafé Original Instant Coffee 200g'),
  'nescafe gold':            branded(6.50, 'Nescafé Gold Blend 200g'),
  'kenco':                   branded(5.75, 'Kenco Rich Instant Coffee 200g'),
  'douwe egberts':           branded(5.50, 'Douwe Egberts Pure Indulgence Instant 190g'),
  'lavazza coffee':          branded(4.00, 'Lavazza Qualità Rossa Ground 250g'),
  'taylors coffee':          branded(4.25, "Taylors of Harrogate Rich Italian Ground 227g"),
  'cadbury hot chocolate':   branded(3.50, "Cadbury Drinking Chocolate 500g", { hasIceland: true }),
  'options hot chocolate':   branded(3.00, 'Options Belgian Hot Chocolate 220g'),

  // ===== BRANDED: Soft Drinks =====
  'coca cola':               branded(2.15, 'Coca-Cola Original 2L', { hasIceland: true }),
  'coca-cola':               branded(2.15, 'Coca-Cola Original 2L', { hasIceland: true }),
  'diet coke':               branded(2.15, 'Diet Coke 2L', { hasIceland: true }),
  'coke zero':               branded(2.15, 'Coca-Cola Zero Sugar 2L', { hasIceland: true }),
  'pepsi':                   branded(2.00, 'Pepsi 2L', { hasIceland: true }),
  'pepsi max':               branded(2.00, 'Pepsi Max 2L', { hasIceland: true }),
  'fanta':                   branded(2.00, 'Fanta Orange 2L', { hasIceland: true }),
  'sprite':                  branded(2.00, 'Sprite 2L'),
  '7up':                     branded(1.85, '7UP 2L'),
  'irn bru':                 branded(1.65, 'IRN-BRU 2L', { hasIceland: true }),
  'lucozade':                branded(1.85, 'Lucozade Energy Orange 900ml'),
  'ribena':                  branded(2.50, 'Ribena Blackcurrant 600ml'),
  'robinsons squash':        branded(2.00, "Robinsons Orange Squash 900ml"),
  'vimto':                   branded(2.00, 'Vimto Original 725ml'),
  'oasis':                   branded(1.50, 'Oasis Citrus Punch 500ml'),
  'tropicana':               branded(3.00, 'Tropicana Original Orange Juice 950ml'),
  'innocent smoothie':       branded(3.50, 'Innocent Smoothie 750ml'),
  'red bull':                branded(1.65, 'Red Bull Energy Drink 250ml'),
  'monster energy':          branded(1.65, 'Monster Energy 500ml'),
  'highland spring':         branded(0.85, 'Highland Spring Still Water 1.5L'),
  'evian':                   branded(1.10, 'Evian Still Water 1.5L'),
  'volvic':                  branded(1.00, 'Volvic Still Water 1.5L'),

  // ===== BRANDED: Biscuits & Chocolate =====
  'mcvities digestives':     branded(1.65, "McVitie's Digestives 400g"),
  'mcvities chocolate digestives': branded(2.00, "McVitie's Chocolate Digestives 300g"),
  'mcvities hobnobs':        branded(1.65, "McVitie's Hobnobs 300g"),
  'mcvities rich tea':       branded(1.15, "McVitie's Rich Tea 300g"),
  'mcvities':                branded(1.65, "McVitie's Digestives 400g"),
  'fox biscuits':            branded(1.50, "Fox's Crunch Creams 200g"),
  'maryland cookies':        branded(1.30, 'Maryland Cookies Choc Chip 200g'),
  'oreo':                    branded(1.75, 'Oreo Original 154g'),
  'penguin':                 branded(1.50, "McVitie's Penguin 8 Pack"),
  'club biscuits':           branded(1.40, 'Jacobs Club Orange 8 Pack'),
  'tunnocks':                branded(1.50, "Tunnock's Caramel Wafer 4 Pack"),
  'tunnocks tea cakes':      branded(1.85, "Tunnock's Tea Cakes 6 Pack"),
  'kitkats':                 branded(2.00, 'KitKat 2 Finger 9 Pack', { hasIceland: true }),
  'cadbury dairy milk':      branded(2.00, 'Cadbury Dairy Milk 180g', { hasIceland: true }),
  'cadbury':                 branded(2.00, 'Cadbury Dairy Milk 180g', { hasIceland: true }),
  'cadbury roses':           branded(5.00, 'Cadbury Roses 290g'),
  'cadbury fingers':         branded(2.00, 'Cadbury Fingers 114g'),
  'cadbury buttons':         branded(1.35, 'Cadbury Dairy Milk Giant Buttons 119g'),
  'cadbury twirl':           branded(2.00, 'Cadbury Twirl 5 Pack'),
  'galaxy':                  branded(2.00, 'Galaxy Smooth Milk 180g'),
  'galaxy chocolate':        branded(2.00, 'Galaxy Smooth Milk 180g'),
  'maltesers':               branded(2.50, 'Maltesers 189g', { hasIceland: true }),
  'celebrations':            branded(5.50, 'Celebrations 380g'),
  'quality street':          branded(5.50, 'Quality Street 382g'),
  'heroes':                  branded(5.50, 'Cadbury Heroes 290g'),
  'toblerone':               branded(4.00, 'Toblerone 360g'),
  'lindt':                   branded(3.50, 'Lindt Excellence 85% Dark 100g'),
  'green & blacks':          branded(2.75, "Green & Black's Organic Dark 90g"),
  'terry chocolate orange':  branded(3.50, "Terry's Chocolate Orange 157g", { hasIceland: true }),
  'after eight':             branded(3.50, 'After Eight 200g'),
  'ferrero rocher':          branded(5.50, 'Ferrero Rocher 16 Pack'),
  'bounty':                  branded(1.50, 'Bounty 4 Pack'),
  'snickers':                branded(1.50, 'Snickers 4 Pack', { hasIceland: true }),
  'mars':                    branded(1.50, 'Mars 4 Pack', { hasIceland: true }),
  'twix':                    branded(1.50, 'Twix 4 Pack', { hasIceland: true }),
  'haribo tangfastics':      branded(1.25, 'Haribo Tangfastics 160g', { hasIceland: true }),
  'haribo starmix':          branded(1.25, 'Haribo Starmix 160g', { hasIceland: true }),
  'wine gums':               branded(1.30, 'Maynards Bassetts Wine Gums 165g'),
  'jelly babies':            branded(1.30, 'Bassetts Jelly Babies 165g'),
  'fruit pastilles':         branded(1.30, 'Rowntrees Fruit Pastilles 143g'),

  // ===== BRANDED: Crisps & Snacks =====
  'walkers crisps':          branded(2.00, 'Walkers Ready Salted 6 Pack', { hasIceland: true }),
  'walkers':                 branded(2.00, 'Walkers Ready Salted 6 Pack', { hasIceland: true }),
  'walkers multipack':       branded(3.50, 'Walkers Classic Variety 12 Pack'),
  'walkers sensations':      branded(2.50, 'Walkers Sensations Thai Sweet Chilli 150g'),
  'pringles':                branded(2.75, 'Pringles Original 200g', { hasIceland: true }),
  'doritos':                 branded(2.50, 'Doritos Chilli Heatwave 180g', { hasIceland: true }),
  'kettle chips':            branded(2.50, 'Kettle Chips Sea Salt 150g'),
  'tyrells':                 branded(2.50, "Tyrrells Lightly Sea Salted 150g"),
  'monster munch':           branded(1.50, 'Monster Munch Roast Beef 6 Pack'),
  'wotsits':                 branded(1.50, 'Wotsits Really Cheesy 6 Pack'),
  'quavers':                 branded(1.50, 'Quavers 6 Pack'),
  'hula hoops':              branded(1.50, 'Hula Hoops Original 6 Pack'),
  'skips':                   branded(1.50, 'Skips Prawn Cocktail 6 Pack'),
  'french fries':            branded(1.50, 'French Fries Ready Salted 6 Pack'),
  'mccoys':                  branded(2.00, "McCoy's Ridge Cut 6 Pack"),
  'jacobs crackers':         branded(1.75, "Jacob's Cream Crackers 300g"),
  'ritz crackers':           branded(1.65, 'Ritz Original Crackers 200g'),
  'mini cheddars':           branded(1.75, "Jacob's Mini Cheddars 6 Pack"),
  'popcorners':              branded(2.50, 'PopCorners Sea Salt 85g'),
  'nakd bars':               branded(3.00, 'Nakd Berry Delight 4 Pack'),
  'graze':                   branded(3.00, 'Graze Cocoa Oat Boost Snack Mix 4 Pack'),
  'kp nuts':                 branded(2.75, 'KP Original Salted Peanuts 250g'),
  'dry roasted peanuts':     branded(2.50, 'KP Dry Roasted Peanuts 250g'),

  // ===== BRANDED: Dairy & Yoghurt =====
  'muller yoghurt':          branded(0.75, 'Müller Corner Strawberry'),
  'muller corner':           branded(0.75, 'Müller Corner Strawberry'),
  'muller rice':             branded(0.75, 'Müller Rice Original'),
  'muller light':            branded(3.00, 'Müller Light 6 Pack'),
  'activia':                 branded(3.00, 'Activia Strawberry 4 Pack'),
  'yeo valley':              branded(1.50, 'Yeo Valley Organic Natural Yoghurt 500g'),
  'fage yoghurt':            branded(2.25, 'FAGE Total 0% 500g'),
  'petit filous':            branded(2.50, 'Petits Filous Strawberry 6 Pack', { hasIceland: true }),
  'cravendale milk':         branded(1.95, 'Cravendale Semi Skimmed Milk 2L'),
  'alpro oat milk':          branded(1.95, 'Alpro Oat Drink 1L'),
  'alpro soy milk':          branded(1.55, 'Alpro Soya Original 1L'),
  'oatly':                   branded(2.10, 'Oatly Oat Drink Barista Edition 1L'),
  'innocent juice':          branded(2.75, 'Innocent Orange Juice 900ml'),

  // ===== BRANDED: Frozen =====
  'birds eye fish fingers':  branded(3.50, 'Birds Eye 10 Fish Fingers 280g', { hasIceland: true }),
  'birds eye peas':          branded(1.85, 'Birds Eye Garden Peas 800g', { hasIceland: true }),
  'birds eye':               branded(3.50, 'Birds Eye 10 Fish Fingers 280g', { hasIceland: true }),
  'birds eye chicken':       branded(3.75, 'Birds Eye Chicken Dippers 12 Pack', { hasIceland: true }),
  'mccain chips':            branded(2.75, 'McCain Oven Chips Straight Cut 907g', { hasIceland: true }),
  'mccain':                  branded(2.75, 'McCain Oven Chips Straight Cut 907g', { hasIceland: true }),
  'mccain wedges':           branded(2.50, 'McCain Wedges 750g', { hasIceland: true }),
  'aunt bessies':            branded(1.75, "Aunt Bessie's Yorkshire Puddings 12 Pack", { hasIceland: true }),
  'aunt bessies roast potatoes': branded(2.25, "Aunt Bessie's Roast Potatoes 800g", { hasIceland: true }),
  'chicago town pizza':      branded(2.50, 'Chicago Town Tiger Crust Pepperoni', { hasIceland: true }),
  'goodfellas pizza':        branded(2.75, "Goodfella's Stonebaked Margherita"),
  'dr oetker pizza':         branded(3.50, 'Dr. Oetker Ristorante Margherita'),
  'ben and jerrys':          branded(5.50, "Ben & Jerry's Cookie Dough 465ml"),
  'haagen dazs':             branded(5.75, 'Häagen-Dazs Vanilla 460ml'),
  'magnum':                  branded(4.00, 'Magnum Classic 4 Pack', { hasIceland: true }),
  'cornetto':                branded(3.25, 'Cornetto Classico 4 Pack', { hasIceland: true }),
  'viennetta':               branded(2.50, 'Viennetta Vanilla 650ml', { hasIceland: true }),
  'fab ice lolly':           branded(2.25, 'Fab Ice Lollies 6 Pack', { hasIceland: true }),
  'calippo':                 branded(2.75, 'Calippo Orange 6 Pack', { hasIceland: true }),
  "young's fish":            branded(3.50, "Young's Breaded Fish Fillets 4 Pack"),
  'quorn mince':             branded(3.00, 'Quorn Mince 300g'),
  'quorn':                   branded(3.00, 'Quorn Mince 300g'),
  'linda mccartney':         branded(2.75, 'Linda McCartney Sausages 6 Pack'),
  'richmond sausages':       branded(2.50, 'Richmond Pork Sausages 8 Pack', { hasIceland: true }),

  // ===== BRANDED: Pasta & Cooking =====
  'napolina pasta':          branded(1.20, 'Napolina Penne Pasta 500g'),
  'de cecco pasta':          branded(2.00, 'De Cecco Penne Rigate 500g'),
  'barilla pasta':           branded(1.50, 'Barilla Penne Rigate 500g'),
  'tilda rice':              branded(2.75, 'Tilda Basmati Rice 1kg'),
  'tilda':                   branded(2.75, 'Tilda Basmati Rice 1kg'),
  'uncle bens rice':         branded(1.60, "Ben's Original Microwave Basmati 250g", { hasIceland: true }),
  'ben original rice':       branded(1.60, "Ben's Original Long Grain Rice 250g", { hasIceland: true }),
  'pot noodle':              branded(1.25, 'Pot Noodle Chicken & Mushroom', { hasIceland: true }),
  'super noodles':           branded(0.85, 'Batchelors Super Noodles Chicken', { hasIceland: true }),
  'batchelors':              branded(0.85, 'Batchelors Super Noodles Chicken', { hasIceland: true }),
  'maggi noodles':           branded(1.00, 'Maggi 2 Minute Noodles 5 Pack'),
  'filippo berio':           branded(5.50, 'Filippo Berio Extra Virgin Olive Oil 500ml'),
  'bertolli olive oil':      branded(5.00, 'Bertolli Extra Virgin Olive Oil 500ml'),
  'crisp n dry':             branded(2.75, "Crisp 'n Dry Vegetable Oil 1L"),

  // ===== BRANDED: Household =====
  'andrex':                  branded(5.50, 'Andrex Classic Clean 9 Rolls', { hasIceland: true }),
  'andrex toilet roll':      branded(5.50, 'Andrex Classic Clean 9 Rolls', { hasIceland: true }),
  'cushelle':                branded(4.75, 'Cushelle Original 9 Rolls'),
  'plenty kitchen roll':     branded(3.00, 'Plenty The Original One 2 Rolls'),
  'fairy liquid':            branded(1.75, 'Fairy Original Washing Up Liquid 383ml'),
  'fairy':                   branded(1.75, 'Fairy Original Washing Up Liquid 383ml'),
  'fairy platinum':          branded(4.50, 'Fairy Platinum Dishwasher Tablets 30 Pack'),
  'finish dishwasher':       branded(5.50, 'Finish Quantum All in 1 Dishwasher Tablets 30 Pack'),
  'finish':                  branded(5.50, 'Finish Quantum All in 1 Dishwasher Tablets 30 Pack'),
  'persil':                  branded(6.00, 'Persil Non Bio Laundry Liquid 30 Wash'),
  'bold':                    branded(5.50, 'Bold 2-in-1 Washing Liquid 30 Wash'),
  'ariel':                   branded(6.50, 'Ariel Original Washing Liquid 30 Wash'),
  'surf':                    branded(5.00, 'Surf Tropical Lily Liquid 30 Wash'),
  'comfort':                 branded(3.50, 'Comfort Pure Fabric Conditioner 1.16L'),
  'lenor':                   branded(3.75, 'Lenor Spring Awakening 1.15L'),
  'domestos':                branded(1.50, 'Domestos Original Bleach 750ml'),
  'cillit bang':             branded(3.00, 'Cillit Bang Power Cleaner 750ml'),
  'dettol':                  branded(2.50, 'Dettol All-in-One Spray 500ml'),
  'flash':                   branded(2.25, 'Flash All Purpose Cleaner 750ml'),
  'mr muscle':               branded(2.50, 'Mr Muscle Kitchen Cleaner 750ml'),
  'vanish':                  branded(4.50, 'Vanish Gold Oxi Action Stain Remover 470ml'),
  'febreze':                 branded(3.50, 'Febreze Air Freshener 300ml'),

  // ===== BRANDED: Toiletries =====
  'colgate toothpaste':      branded(2.50, 'Colgate Maximum Cavity Protection 100ml'),
  'sensodyne':               branded(4.50, 'Sensodyne Sensitive Toothpaste 75ml'),
  'oral-b toothbrush':       branded(3.50, 'Oral-B CrossAction Manual Toothbrush'),
  'dove shower gel':         branded(2.25, 'Dove Original Shower Gel 250ml'),
  'radox':                   branded(1.75, 'Radox Feel Good Shower Gel 250ml'),
  'imperial leather':        branded(1.50, 'Imperial Leather Shower Gel 250ml'),
  'head shoulders':          branded(3.75, 'Head & Shoulders Classic Clean 400ml'),
  'pantene':                 branded(3.50, 'Pantene Pro-V Smooth & Sleek Shampoo 400ml'),
  'tresemme':                branded(4.50, "TRESemmé Smooth & Silky Shampoo 900ml"),
  'sure deodorant':          branded(2.75, 'Sure Cotton Dry Anti-Perspirant 250ml'),
  'dove deodorant':          branded(3.00, 'Dove Original Anti-Perspirant 250ml'),
  'lynx':                    branded(3.50, 'Lynx Africa Bodyspray 150ml'),
  'nivea':                   branded(3.00, 'NIVEA Soft Moisturising Cream 200ml'),
  'simple face wash':        branded(3.50, 'Simple Refreshing Facial Wash 150ml'),
  'pampers':                 branded(9.00, 'Pampers Baby-Dry Nappies Size 4 44 Pack', { hasIceland: true }),
  'huggies':                 branded(8.50, 'Huggies Pure Baby Wipes 56 Pack'),

  // ===== BRANDED: Meat =====
  'richmond':                branded(2.50, 'Richmond Pork Sausages 8 Pack', { hasIceland: true }),
  'walls sausages':          branded(2.25, "Wall's 8 Pork Sausages", { hasIceland: true }),

  // ===== BRANDED: Pet Food =====
  'whiskas':                 branded(4.50, 'Whiskas Cat Food Pouches 12 Pack', { hasIceland: true }),
  'felix':                   branded(4.75, 'Felix Cat Food Pouches 12 Pack', { hasIceland: true }),
  'sheba':                   branded(3.75, 'Sheba Cat Food Trays 8 Pack'),
  'dreamies':                branded(1.50, 'Dreamies Cat Treats 60g'),
  'pedigree':                branded(4.75, 'Pedigree Dog Food Pouches 12 Pack', { hasIceland: true }),
  'bakers':                  branded(4.25, "Bakers Adult Dog Food 1kg"),
  'cesar':                   branded(3.75, 'Cesar Dog Food Trays 8 Pack'),
  'dentastix':               branded(3.00, 'Pedigree Dentastix 7 Pack'),

  // ===== BRANDED: Alcohol =====
  'stella artois':           branded(5.50, 'Stella Artois 4x440ml'),
  'carling':                 branded(4.50, 'Carling Original Lager 4x440ml'),
  'fosters':                 branded(4.25, "Foster's Lager 4x440ml"),
  'budweiser':               branded(5.25, 'Budweiser 4x440ml'),
  'heineken':                branded(5.50, 'Heineken 4x440ml'),
  'peroni':                  branded(6.00, 'Peroni Nastro Azzurro 4x330ml'),
  'corona':                  branded(6.50, 'Corona Extra 4x330ml'),
  'guinness':                branded(5.75, 'Guinness Draught 4x440ml'),
  'birra moretti':           branded(6.00, 'Birra Moretti 4x330ml'),
  'strongbow':               branded(4.50, 'Strongbow Original Cider 4x440ml'),
  'kopparberg':              branded(5.75, 'Kopparberg Mixed Fruit Cider 4x330ml'),
  'gordons gin':             branded(16.00, "Gordon's London Dry Gin 70cl"),
  'smirnoff':                branded(15.50, 'Smirnoff Red Label Vodka 70cl'),
  'jack daniels':            branded(22.00, "Jack Daniel's Tennessee Whiskey 70cl"),
  'captain morgan':          branded(16.00, 'Captain Morgan Original Spiced Rum 70cl'),
  'baileys':                 branded(14.00, "Baileys Original Irish Cream 70cl"),
};

// ==================== SEARCH / MATCHING ====================

// Common aliases and plurals
const ALIASES: Record<string, string> = {
  'spuds': 'potatoes',
  'chips': 'chips',
  'fries': 'chips',
  'oven chips': 'chips',
  'frozen chips': 'chips',
  'tatties': 'potatoes',
  'mash': 'potatoes',
  'cheddar': 'cheese',
  'mature cheddar': 'cheese',
  'semi skimmed milk': 'milk',
  'full fat milk': 'whole milk',
  'semi skimmed': 'milk',
  'skimmed': 'skimmed milk',
  'oj': 'orange juice',
  'loo roll': 'toilet roll',
  'bog roll': 'toilet roll',
  'kitchen towel': 'kitchen roll',
  'washing powder': 'laundry detergent',
  'washing liquid': 'laundry detergent',
  'dish soap': 'washing up liquid',
  'fairy liquid': 'washing up liquid',
  'beef mince': 'mince beef',
  'minced beef': 'mince beef',
  'minced lamb': 'lamb mince',
  'minced pork': 'pork mince',
  'minced turkey': 'turkey mince',
  'chicken fillet': 'chicken breast',
  'chicken fillets': 'chicken breast',
  'streaky bacon': 'bacon',
  'back bacon': 'bacon',
  'brekkie': 'bacon',
  'tomato sauce': 'pasta sauce',
  'bolognese sauce': 'pasta sauce',
  'tinned tuna': 'tuna',
  'canned tuna': 'tuna',
  'tin of beans': 'baked beans',
  'beans': 'baked beans',
  'tinned beans': 'baked beans',
  'tin of tomatoes': 'chopped tomatoes',
  'tinned toms': 'chopped tomatoes',
  'frozen fish fingers': 'fish fingers',
  'oven pizza': 'pizza',
  'frozen pizza': 'pizza',
  'spread': 'margarine',
  'margarine': 'margarine',
  'flora': 'margarine',
  'veg oil': 'cooking oil',
  'vegetable oil': 'cooking oil',
  'evoo': 'extra virgin olive oil',
  // coca cola / pepsi are in DB directly
  'fizzy water': 'sparkling water',
  'mineral water': 'still water',
  'bottled water': 'still water',
  'teabags': 'tea',
  'tea bags': 'tea',
  'instant coffee': 'coffee',
  'cordial': 'squash',
  'juice': 'orange juice',
  'fruit juice': 'orange juice',
  'ribena': 'squash',
  'robinsons': 'robinsons squash',
  'pop': 'lemonade',
  'fizzy drink': 'lemonade',
  'soda': 'lemonade',
  'packet noodles': 'instant noodles',
  'pot noodle': 'instant noodles',
  'super noodles': 'instant noodles',
  'porridge': 'porridge oats',
  'oats': 'porridge oats',
  'ready brek': 'porridge oats',
  'cornflakes': 'cereal',
  'weetabix': 'cereal',
  'coco pops': 'cereal',
  'plain flour': 'flour',
  'white flour': 'flour',
  'white sugar': 'sugar',
  'granulated sugar': 'sugar',
  'sarnies': 'sandwiches',
  'sandwich': 'sandwiches',
  'butty': 'sandwiches',
  'sarnie': 'sandwiches',
  'sarny': 'sandwiches',
  'foil': 'tin foil',
  'aluminium foil': 'tin foil',
  'kitchen foil': 'tin foil',
  'cling wrap': 'cling film',
  'bin liners': 'bin bags',
  'rubbish bags': 'bin bags',
  'refuse sacks': 'bin bags',
  'washing tablets': 'dishwasher tablets',
  'dishwasher pods': 'dishwasher tablets',
  'hand wash': 'hand soap',
  'body wash': 'shower gel',
  'tooth paste': 'toothpaste',

  // Brand aliases
  'heinz beans': 'heinz baked beans',
  'heinz beanz': 'heinz baked beans',
  'beanz': 'heinz baked beans',
  'heinz soup': 'heinz tomato soup',
  'john west': 'john west tuna',
  'princes': 'princes tuna',
  'ambrosia': 'ambrosia custard',
  'hellmanns': 'hellmanns mayo',
  "hellmann's": 'hellmanns mayo',
  'lurpak spreadable': 'lurpak',
  'philadelphia cream cheese': 'philadelphia',
  'philly': 'philadelphia',
  'dairylea triangles': 'dairylea',
  'cathedral city cheddar': 'cathedral city',
  'warburtons toastie': 'warburtons',
  'warburtons white': 'warburtons',
  'hovis white': 'hovis',
  'kingsmill white': 'kingsmill',
  'old el paso': 'old el paso wraps',
  'fajita kit': 'old el paso kit',
  'jaffa cakes': 'mcvities jaffa cakes',
  'corn flakes': 'kelloggs cornflakes',
  'crunchy nut': 'kelloggs crunchy nut',
  'special k': 'kelloggs special k',
  'kelloggs rice krispies': 'rice krispies',
  'kelloggs frosties': 'frosties',
  'pg': 'pg tips',
  'yorkshire': 'yorkshire tea',
  'nescafe instant': 'nescafe',
  'nescafe gold blend': 'nescafe gold',
  'kenco coffee': 'kenco',
  'lavazza': 'lavazza coffee',
  'taylors': 'taylors coffee',
  'cadbury drinking chocolate': 'cadbury hot chocolate',
  'coke': 'coca cola',
  'coca-cola zero': 'coke zero',
  'diet coca cola': 'diet coke',
  'fanta orange': 'fanta',
  'sprite lemonade': 'sprite',
  'irn-bru': 'irn bru',
  'lucozade energy': 'lucozade',
  'tropicana juice': 'tropicana',
  'tropicana oj': 'tropicana',
  'innocent': 'innocent smoothie',
  'digestives': 'mcvities digestives',
  'chocolate digestives': 'mcvities chocolate digestives',
  'hobnobs': 'mcvities hobnobs',
  'rich tea': 'mcvities rich tea',
  'jaffa cake': 'mcvities jaffa cakes',
  'penguin biscuits': 'penguin',
  'tunnock wafers': 'tunnocks',
  'tunnock tea cakes': 'tunnocks tea cakes',
  'kit kat': 'kitkats',
  'kitkat': 'kitkats',
  'dairy milk': 'cadbury dairy milk',
  'cadbury buttons': 'cadbury buttons',
  'cadbury twirl biscuit': 'cadbury twirl',
  'galaxy bar': 'galaxy',
  'toblerone bar': 'toblerone',
  'lindt chocolate': 'lindt',
  'chocolate orange': 'terry chocolate orange',
  'after eights': 'after eight',
  'snickers bar': 'snickers',
  'mars bar': 'mars',
  'twix bar': 'twix',
  'tangfastics': 'haribo tangfastics',
  'starmix': 'haribo starmix',
  'walkers ready salted': 'walkers crisps',
  'walkers variety': 'walkers multipack',
  'sensations': 'walkers sensations',
  'pringles tube': 'pringles',
  'doritos crisps': 'doritos',
  'kettle': 'kettle chips',
  'muller': 'muller yoghurt',
  'müller': 'muller yoghurt',
  'muller rice pudding': 'muller rice',
  'activia yoghurt': 'activia',
  'yeo valley': 'yeo valley',
  'petit filous': 'petit filous',
  'alpro': 'alpro oat milk',
  'alpro oat': 'alpro oat milk',
  'alpro soya': 'alpro soy milk',
  'oatly oat milk': 'oatly',
  'oatly barista': 'oatly',
  'birds eye fingers': 'birds eye fish fingers',
  'fish fingers birds eye': 'birds eye fish fingers',
  'captain birds eye': 'birds eye fish fingers',
  'chicken dippers': 'birds eye chicken',
  'mccain oven chips': 'mccain chips',
  'mccain fries': 'mccain chips',
  'aunt bessies yorkshires': 'aunt bessies',
  'yorkshire puddings': 'aunt bessies',
  'chicago town': 'chicago town pizza',
  'goodfellas': 'goodfellas pizza',
  'dr oetker': 'dr oetker pizza',
  'ristorante pizza': 'dr oetker pizza',
  'ben and jerrys ice cream': 'ben and jerrys',
  'ben & jerrys': 'ben and jerrys',
  "ben & jerry's": 'ben and jerrys',
  'haagen-dazs': 'haagen dazs',
  'häagen-dazs': 'haagen dazs',
  'magnum ice cream': 'magnum',
  'cornetto ice cream': 'cornetto',
  'quorn mince': 'quorn mince',
  'quorn sausages': 'linda mccartney',
  'linda mccartney sausages': 'linda mccartney',
  'richmond sausage': 'richmond sausages',
  'tilda basmati': 'tilda rice',
  'uncle bens': 'uncle bens rice',
  "ben's original": 'ben original rice',
  'pot noodles': 'pot noodle',
  'super noodle': 'super noodles',
  'batchelors noodles': 'batchelors',
  'filippo berio olive oil': 'filippo berio',
  'bertolli': 'bertolli olive oil',
  'andrex loo roll': 'andrex',
  'andrex classic': 'andrex',
  'cushelle toilet roll': 'cushelle',
  'plenty': 'plenty kitchen roll',
  'fairy washing up': 'fairy liquid',
  'fairy washing up liquid': 'fairy liquid',
  'fairy dishwasher': 'fairy platinum',
  'finish tablets': 'finish dishwasher',
  'persil washing': 'persil',
  'persil liquid': 'persil',
  'ariel washing': 'ariel',
  'ariel liquid': 'ariel',
  'bold washing': 'bold',
  'surf washing': 'surf',
  'comfort softener': 'comfort',
  'lenor softener': 'lenor',
  'domestos bleach': 'domestos',
  'dettol spray': 'dettol',
  'flash cleaner': 'flash',
  'colgate': 'colgate toothpaste',
  'sensodyne toothpaste': 'sensodyne',
  'dove': 'dove shower gel',
  'radox shower': 'radox',
  'head and shoulders': 'head shoulders',
  'h&s shampoo': 'head shoulders',
  'pantene shampoo': 'pantene',
  'tresemme': 'tresemme',
  'sure': 'sure deodorant',
  'lynx africa': 'lynx',
  'nivea cream': 'nivea',
  'pampers nappies': 'pampers',
  'huggies wipes': 'huggies',
  'whiskas cat food': 'whiskas',
  'felix cat food': 'felix',
  'sheba cat food': 'sheba',
  'pedigree dog food': 'pedigree',
  'pedigree dentastix': 'dentastix',
  'bakers dog food': 'bakers',
  'cesar dog food': 'cesar',
  'stella': 'stella artois',
  'stella lager': 'stella artois',
  'fosters lager': 'fosters',
  'budweiser beer': 'budweiser',
  'bud': 'budweiser',
  'heineken beer': 'heineken',
  'peroni beer': 'peroni',
  'corona beer': 'corona',
  'guinness stout': 'guinness',
  'moretti': 'birra moretti',
  'birra moretti beer': 'birra moretti',
  'strongbow cider': 'strongbow',
  'kopparberg cider': 'kopparberg',
  'gordons': 'gordons gin',
  "gordon's": 'gordons gin',
  "gordon's gin": 'gordons gin',
  'smirnoff vodka': 'smirnoff',
  'jack daniels whiskey': 'jack daniels',
  "jack daniel's": 'jack daniels',
  'jd whiskey': 'jack daniels',
  'captain morgan rum': 'captain morgan',
  'baileys irish cream': 'baileys',
  'bangers': 'sausages',
  'snags': 'sausages',
  'chicken pieces': 'chicken thighs',
  'chook': 'whole chicken',
  'roast chicken': 'whole chicken',
  'rotisserie chicken': 'whole chicken',
};

function normalise(s: string): string {
  return s.toLowerCase().trim()
    .replace(/['']/g, "'")  // normalize apostrophes
    .replace(/\s+/g, ' ');  // collapse whitespace
}

// Remove trailing 's' for basic plural handling
function deplural(s: string): string {
  if (s.endsWith('ies') && s.length > 4) return s.slice(0, -3) + 'y'; // berries -> berry
  if (s.endsWith('oes')) return s.slice(0, -2); // tomatoes -> tomato
  if (s.endsWith('es') && s.length > 3) return s.slice(0, -2); // dishes -> dish
  if (s.endsWith('s') && !s.endsWith('ss') && s.length > 3) return s.slice(0, -1);
  return s;
}

function findItemInDatabase(itemName: string): string | null {
  const norm = normalise(itemName);

  // 1. Direct match
  if (PRICE_DATABASE[norm]) return norm;

  // 2. Alias match
  if (ALIASES[norm] && PRICE_DATABASE[ALIASES[norm]]) return ALIASES[norm];

  // 3. Depluralized match
  const dep = deplural(norm);
  if (PRICE_DATABASE[dep]) return dep;
  if (ALIASES[dep] && PRICE_DATABASE[ALIASES[dep]]) return ALIASES[dep];

  // 4. Partial match - search term is contained in a key or vice versa
  for (const key of Object.keys(PRICE_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) return key;
  }

  // 5. Try depluralized partial match
  for (const key of Object.keys(PRICE_DATABASE)) {
    if (dep.includes(key) || key.includes(dep)) return key;
  }

  // 6. Word overlap match (at least one meaningful word matches)
  const words = norm.split(/\s+/).filter(w => w.length > 2);
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const key of Object.keys(PRICE_DATABASE)) {
    const keyWords = key.split(/\s+/);
    let score = 0;
    for (const word of words) {
      for (const kw of keyWords) {
        if (kw === word || kw === deplural(word)) score += 2;
        else if (kw.includes(word) || word.includes(kw)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  if (bestScore >= 2) return bestMatch;

  return null;
}

export function getPricesForItem(itemName: string): PriceResult[] {
  const dbKey = findItemInDatabase(itemName);
  if (!dbKey) return [];

  const pricesForItem = PRICE_DATABASE[dbKey];
  if (!pricesForItem) return [];

  const overrides = loadOverrides();

  return Object.entries(pricesForItem).map(([brand, data]) => {
    const b = brand as SupermarketBrand;
    const userPrice = overrides[dbKey]?.[b];
    return {
      itemName: dbKey,
      brand: b,
      price: userPrice ?? data!.price,
      productName: data!.productName,
    };
  });
}

export function comparePricesForList(items: ShoppingItem[]): StorePriceComparison[] {
  const brandTotals: Partial<Record<SupermarketBrand, StorePriceComparison>> = {};

  for (const item of items) {
    const itemPrices = getPricesForItem(item.name);

    for (const priceResult of itemPrices) {
      if (!brandTotals[priceResult.brand]) {
        brandTotals[priceResult.brand] = {
          brand: priceResult.brand,
          totalPrice: 0,
          itemsFound: 0,
          itemsTotal: items.length,
          items: [],
        };
      }

      const entry = brandTotals[priceResult.brand]!;
      const itemTotal = priceResult.price * item.quantity;
      entry.totalPrice += itemTotal;
      entry.itemsFound += 1;
      entry.items.push({ ...priceResult, price: itemTotal });
    }
  }

  return Object.values(brandTotals)
    .filter((b): b is StorePriceComparison => b !== undefined)
    .sort((a, b) => {
      if (b.itemsFound !== a.itemsFound) return b.itemsFound - a.itemsFound;
      return a.totalPrice - b.totalPrice;
    });
}

export function getAvailableItems(): string[] {
  return Object.keys(PRICE_DATABASE).sort();
}

// ==================== USER PRICE OVERRIDES ====================
const PRICE_OVERRIDES_KEY = 'gshop-price-overrides';

type PriceOverrides = Record<string, Partial<Record<SupermarketBrand, number>>>;

let _overridesCache: PriceOverrides | null = null;

function loadOverrides(): PriceOverrides {
  if (_overridesCache) return _overridesCache;
  try {
    const data = localStorage.getItem(PRICE_OVERRIDES_KEY);
    _overridesCache = data ? JSON.parse(data) : {};
  } catch {
    _overridesCache = {};
  }
  return _overridesCache!;
}

function saveOverrides(overrides: PriceOverrides) {
  _overridesCache = overrides;
  localStorage.setItem(PRICE_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function setUserPrice(itemKey: string, brand: SupermarketBrand, price: number) {
  const overrides = loadOverrides();
  if (!overrides[itemKey]) overrides[itemKey] = {};
  overrides[itemKey][brand] = price;
  saveOverrides(overrides);
}

export function removeUserPrice(itemKey: string, brand: SupermarketBrand) {
  const overrides = loadOverrides();
  if (overrides[itemKey]) {
    delete overrides[itemKey][brand];
    if (Object.keys(overrides[itemKey]).length === 0) delete overrides[itemKey];
    saveOverrides(overrides);
  }
}

export function getUserPrice(itemKey: string, brand: SupermarketBrand): number | null {
  const overrides = loadOverrides();
  return overrides[itemKey]?.[brand] ?? null;
}

export function clearAllOverrides() {
  _overridesCache = {};
  localStorage.removeItem(PRICE_OVERRIDES_KEY);
}

export function getOverrideCount(): number {
  const overrides = loadOverrides();
  let count = 0;
  for (const item of Object.values(overrides)) {
    count += Object.keys(item).length;
  }
  return count;
}

// Get all prices for an item including user overrides
export function getFullPricesForItem(itemName: string): (PriceResult & { isOverride: boolean })[] {
  const dbKey = findItemInDatabase(itemName);
  if (!dbKey) return [];

  const basePrices = PRICE_DATABASE[dbKey];
  if (!basePrices) return [];

  const overrides = loadOverrides();

  return Object.entries(basePrices).map(([brand, data]) => {
    const b = brand as SupermarketBrand;
    const userPrice = overrides[dbKey]?.[b];
    return {
      itemName: dbKey,
      brand: b,
      price: userPrice ?? data!.price,
      productName: data!.productName,
      isOverride: userPrice != null,
    };
  });
}

// Invalidate cache (call after edits to ensure getPricesForItem picks up changes)
export function invalidatePriceCache() {
  _overridesCache = null;
}

// Note: getPricesForItem above already applies overrides automatically.
