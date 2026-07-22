"use client";

import { useState } from "react";
import { DiffLine } from "@/components/results/diff-line";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlockWithCopy } from "@/components/ui/code-block";
import { EditableCodeInput } from "@/components/ui/editable-code-input";
import { ResponsiveLink } from "@/components/ui/responsive-link";
import { ScoreRing } from "@/components/ui/score-ring";
import { LeaderboardRow, TableCell, TableRow } from "@/components/ui/table-row";
import { Toggle } from "@/components/ui/toggle";
import { Code, H1, H2, H3, Text } from "@/components/ui/typography";

const initialCode = `function calculateTotal(items) {
  var total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  
  if (total > 100) {
    total = total * 0.9; // apply 10% discount
    console.log("Discount applied");
  }
  
  return total;
}`;

const longCode = `// DevRoast - Code Review Application
function calculateTotal(items) {
  var total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  
  if (total > 100) {
    total = total * 0.9; // apply 10% discount
    console.log("Discount applied");
  }
  
  return total;
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.discount = 0;
  }
  
  addItem(product, quantity) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }
  
  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
  }
  
  getTotal() {
    const subtotal = this.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    return subtotal - (subtotal * this.discount);
  }
  
  applyDiscount(percentage) {
    this.discount = Math.min(percentage, 0.5); // Max 50% discount
  }
  
  // More methods to make this longer
  getItems() {
    return this.items;
  }
  
  clearCart() {
    this.items = [];
    this.discount = 0;
  }
  
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
  
  validateCart() {
    return this.items.every(item => 
      item.product && 
      item.product.price > 0 && 
      item.quantity > 0
    );
  }
  
  getSubtotal() {
    return this.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }
  
  getDiscountAmount() {
    return this.getSubtotal() * this.discount;
  }
}

// Example usage
const cart = new ShoppingCart();
cart.addItem({ id: 1, name: "Laptop", price: 999.99 }, 1);
cart.addItem({ id: 2, name: "Mouse", price: 25.50 }, 2);
cart.addItem({ id: 3, name: "Keyboard", price: 75.00 }, 1);
cart.addItem({ id: 4, name: "Monitor", price: 299.99 }, 1);
cart.applyDiscount(0.1);

console.log("Total items:", cart.getItemCount());
console.log("Subtotal:", cart.getSubtotal());
console.log("Discount:", cart.getDiscountAmount());
console.log("Total:", cart.getTotal());
console.log("Is valid:", cart.validateCart());

// Additional test code to ensure scroll
function processOrder(cart) {
  if (!cart.validateCart()) {
    throw new Error("Invalid cart");
  }
  
  const total = cart.getTotal();
  console.log("Processing order for:", total);
  
  // Simulate payment processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, total });
    }, 1000);
  });
}

async function handleCheckout() {
  try {
    const result = await processOrder(cart);
    console.log("Order processed:", result);
  } catch (error) {
    console.error("Order failed:", error);
  }
}`;

export default function ComponentsPage() {
  const [code, setCode] = useState(initialCode);
  const [longCodeState, setLongCodeState] = useState(longCode);
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);

  return (
    <div className="min-h-screen bg-devroast-bg text-white">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-20 py-8 lg:py-15">
        <header className="mb-8 lg:mb-15">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg sm:text-2xl font-bold text-devroast-green">
              {"//"}
            </span>
            <H1>component_library</H1>
          </div>
        </header>

        <div className="space-y-8 lg:space-y-15">
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>typography</H2>
            </div>

            <div className="space-y-3 lg:space-y-5">
              <H1>paste your code. get roasted.</H1>

              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-devroast-green">
                  {"//"}
                </span>
                <H3>detailed_analysis</H3>
              </div>

              <Text variant="bodySecondary">description text sample</Text>

              <Text variant="small">lang: javascript • 7 lines</Text>

              <Code>function calculateTotal()</Code>
            </div>
          </section>

          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>buttons</H2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button variant="primary" responsive={true}>
                $ roast_my_code
              </Button>
              <Button variant="secondary" responsive={true}>
                $ share_roast
              </Button>
              <ResponsiveLink
                href="/leaderboard"
                variant="button"
                buttonStyle="ghost"
                responsive={true}
              >
                $ view_all &gt;&gt;
              </ResponsiveLink>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>toggle</H2>
            </div>

            <div className="flex items-center gap-8">
              <Toggle
                checked={toggle1}
                onCheckedChange={setToggle1}
                label="roast mode"
              />
              <Toggle
                checked={toggle2}
                onCheckedChange={setToggle2}
                label="roast mode"
              />
            </div>

            {/* Debug info to show state */}
            <div className="mt-4 font-mono text-xs text-devroast-text-muted">
              Toggle 1: {toggle1 ? "ON" : "OFF"} | Toggle 2:{" "}
              {toggle2 ? "ON" : "OFF"}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>badges</H2>
            </div>

            <div className="flex items-center gap-6">
              <Badge variant="critical">critical</Badge>
              <Badge variant="warning">warning</Badge>
              <Badge variant="good">good</Badge>
              <Badge variant="critical">needs_serious_help</Badge>
            </div>
          </section>

          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>cards</H2>
            </div>

            <Card responsive={true}>
              <CardHeader>
                <Badge variant="critical">critical</Badge>
                <CardTitle>using var instead of const/let</CardTitle>
                <CardDescription>
                  the var keyword is function-scoped rather than block-scoped,
                  which can lead to unexpected behavior and bugs. modern
                  javascript uses const for immutable bindings and let for
                  mutable ones.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>code_block</H2>
            </div>

            <div className="space-y-6">
              {/* CodeBlockWithCopy with filename - Responsive */}
              <div className="w-full lg:w-195">
                <CodeBlockWithCopy filename="server.js" size="md">
                  {code}
                </CodeBlockWithCopy>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>code_block</H2>
            </div>

            <div className="space-y-6">
              {/* CodeBlockWithCopy with filename */}
              <CodeBlockWithCopy
                filename="server.js"
                className="w-195" // 780px = 48.75rem
                size="md"
              >
                {code}
              </CodeBlockWithCopy>
            </div>
          </section>

          {/* Editable Code Block Section */}
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>editable_code_block</H2>
            </div>

            <div className="space-y-6">
              {/* EditableCodeInput - Interactive with TypeScript highlighting */}
              <div className="w-full lg:w-195">
                <EditableCodeInput
                  value={code}
                  onChange={setCode}
                  placeholder="// paste your code here to edit..."
                  height="adaptive"
                  responsive={true}
                  showLineNumbers={true}
                  showHeader={true}
                />
              </div>

              {/* Small editable code input example */}
              <div className="w-full sm:w-120">
                <EditableCodeInput
                  value="console.log('hello world');"
                  onChange={() => {}} // Read-only for demo
                  height="auto"
                  responsive={true}
                  showLineNumbers={false}
                  showHeader={false}
                />
              </div>

              {/* Additional EditableCodeInput example with fixed height */}
              <div className="w-full lg:w-195">
                <EditableCodeInput
                  value={code}
                  onChange={setCode}
                  placeholder="// Fixed height like Pencil design (360px)"
                  height="fixed"
                  responsive={true}
                  showLineNumbers={true}
                  showHeader={true}
                />
              </div>
            </div>
          </section>

          {/* Custom Scrollbar Demo Section */}
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>custom_scrollbar_demo</H2>
            </div>

            <div className="space-y-6">
              <Text variant="bodySecondary" className="max-w-2xl">
                This editor demonstrates the DevRoast custom scrollbar. The
                scroll is automatically triggered when content exceeds the max
                height (560px). The scrollbar is synchronized between the
                textarea, syntax highlighting, and line numbers.
                <br />
                <br />
                <strong>Debug info:</strong> The textarea should have classes
                including "devroast-scrollbar" and "overflow-auto". Check
                browser DevTools to inspect the element.
              </Text>

              {/* Long code example to trigger scrollbar */}
              <div className="w-full lg:w-195">
                <EditableCodeInput
                  value={longCodeState}
                  onChange={setLongCodeState}
                  placeholder="// This example has enough code to trigger the custom scrollbar"
                  height="adaptive" // This will show scroll when content exceeds max-h-140 (560px)
                  responsive={true}
                  showLineNumbers={true}
                  showHeader={true}
                />
              </div>

              <div className="bg-devroast-surface border border-devroast-border p-4 font-mono text-xs">
                <div className="text-devroast-green mb-2">
                  {"// Scrollbar Features:"}
                </div>
                <div className="space-y-1 text-devroast-text-secondary">
                  <div>
                    {
                      "• Custom DevRoast theme colors (dark surface, green accent)"
                    }
                  </div>
                  <div>
                    {
                      "• Synchronized scroll between textarea and syntax highlighting"
                    }
                  </div>
                  <div>{"• Line numbers scroll in sync with content"}</div>
                  <div>{"• 8px width with rounded corners"}</div>
                  <div>{"• Hover effects for better UX"}</div>
                  <div>{"• Cross-browser support (Webkit + Firefox)"}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Diff Lines Section */}
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>diff_line</H2>
            </div>

            <div className="w-full lg:w-140 space-y-0 border border-devroast-border">
              <DiffLine type="removed" code="var total = 0;" />
              <DiffLine type="added" code="const total = 0;" />
              <DiffLine
                type="context"
                code="for (let i = 0; i < items.length; i++) {"
              />
            </div>
          </section>

          {/* Table Row Section */}
          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>table_row</H2>
            </div>

            <div className="w-full space-y-3">
              {/* Score-based Auto-coloring Examples */}
              <div className="border border-devroast-border">
                {/* Header */}
                <TableRow
                  variant="static"
                  className="bg-devroast-surface h-10 border-b border-devroast-border"
                >
                  <TableCell
                    width={50}
                    className="text-devroast-text-muted font-mono text-xs font-bold px-5"
                  >
                    RANK
                  </TableCell>
                  <TableCell
                    width={70}
                    className="text-devroast-text-muted font-mono text-xs font-bold"
                  >
                    SCORE
                  </TableCell>
                  <TableCell className="text-devroast-text-muted font-mono text-xs font-bold flex-1">
                    CODE
                  </TableCell>
                  <TableCell
                    width={100}
                    className="text-devroast-text-muted font-mono text-xs font-bold"
                  >
                    LANG
                  </TableCell>
                </TableRow>

                {/* Examples with different score ranges */}
                <LeaderboardRow
                  rank={1}
                  score={1.2} // Red: Bad code (≤3)
                  code='eval(prompt("enter code")) // trust the user lol'
                  language="javascript"
                  responsive={false}
                />
                <LeaderboardRow
                  rank={2}
                  score={4.5} // Yellow/Orange: Medium code (3.1-6)
                  code="if (x == true) { return true; } else { return false; }"
                  language="typescript"
                  responsive={false}
                />
                <LeaderboardRow
                  rank={3}
                  score={8.2} // Green: Good code (6.1-10)
                  code="const users = await db.users.findMany({ where: { isActive: true } });"
                  language="sql"
                  responsive={false}
                />
              </div>

              <Text
                variant="small"
                className="text-devroast-text-muted font-[IBM_Plex_Mono]"
              >
                {`// Auto-colored based on score: Red (1-3), Orange (3.1-6), Green (6.1-10)`}
              </Text>
            </div>
          </section>

          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>navbar</H2>
            </div>

            <div className="flex h-12 sm:h-14 items-center justify-between border-b border-devroast-border bg-devroast-bg px-4 sm:px-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-base sm:text-lg font-bold text-devroast-green">
                  &gt;
                </span>
                <span className="font-mono text-sm sm:text-base font-medium text-devroast-text-primary">
                  devroast
                </span>
              </div>
              <span className="hidden sm:inline font-mono text-xs text-devroast-text-secondary">
                leaderboard
              </span>
            </div>
          </section>

          <section className="space-y-4 lg:space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-devroast-green">
                {"//"}
              </span>
              <H2>score_ring</H2>
            </div>

            <div className="flex justify-center sm:justify-start">
              <ScoreRing score={3.5} maxScore={10} size="lg" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
