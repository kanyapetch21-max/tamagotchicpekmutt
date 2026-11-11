// ==============================================================================
// Module: game_fsm
// Project: PulsePet - CPE222 Final Project
// Target: Nexys A7-100T (Xilinx Artix-7)
// Description: Master Finite State Machine for PulsePet Virtual Pet Game.
//              Corresponds to JavaScript gameState.js prototype.
// ==============================================================================

module game_fsm (
    input  wire       clk,             // 100MHz system clock
    input  wire       rst_n,           // Active-low synchronous reset
    
    // Inputs from Pet Stats Core & Timers
    input  wire [6:0] health,          // 0 - 100
    input  wire       icu_timer_done,  // 10s ICU warning expired
    input  wire       rescue_pass,     // Player solved 3 logic rounds
    input  wire       rescue_fail,     // Player failed ICU puzzle
    
    // Debounced Button Inputs
    input  wire       btn_start,       // Start game / Confirm button
    input  wire       btn_sleep_toggle,// Toggle sleep mode
    input  wire       btn_restart,     // Restart after game over
    
    // State Outputs
    output reg  [2:0] current_state,
    output wire       is_welcome,
    output wire       is_customize,
    output wire       is_normal,
    output wire       is_sleeping,
    output wire       is_icu_warn,
    output wire       is_icu_game,
    output wire       is_success,
    output wire       is_game_over
);

    // FSM State Encoding
    localparam S_WELCOME        = 3'b000; // 0
    localparam S_CUSTOMIZE      = 3'b001; // 1
    localparam S_NORMAL         = 3'b010; // 2
    localparam S_SLEEP          = 3'b011; // 3
    localparam S_ICU_WARN       = 3'b100; // 4
    localparam S_ICU_GAME       = 3'b101; // 5
    localparam S_RESCUE_SUCCESS = 3'b110; // 6
    localparam S_GAME_OVER      = 3'b111; // 7

    reg [2:0] next_state;

    // State Register (Sequential Logic)
    always @(posedge clk) begin
        if (!rst_n) begin
            current_state <= S_WELCOME;
        end else begin
            current_state <= next_state;
        end
    end

    // Next State Logic (Combinational Logic)
    always @(*) begin
        next_state = current_state;

        case (current_state)
            S_WELCOME: begin
                if (btn_start)
                    next_state = S_CUSTOMIZE;
            end

            S_CUSTOMIZE: begin
                if (btn_start)
                    next_state = S_NORMAL;
            end

            S_NORMAL: begin
                if (health <= 7'd15 && health > 7'd0)
                    next_state = S_ICU_WARN;
                else if (health == 7'd0)
                    next_state = S_GAME_OVER;
                else if (btn_sleep_toggle)
                    next_state = S_SLEEP;
            end

            S_SLEEP: begin
                if (health <= 7'd15 && health > 7'd0)
                    next_state = S_ICU_WARN;
                else if (health == 7'd0)
                    next_state = S_GAME_OVER;
                else if (btn_sleep_toggle)
                    next_state = S_NORMAL;
            end

            S_ICU_WARN: begin
                if (health > 7'd15)
                    next_state = S_NORMAL; // Crisis averted!
                else if (icu_timer_done)
                    next_state = S_ICU_GAME; // Transferred to ICU
            end

            S_ICU_GAME: begin
                if (rescue_pass)
                    next_state = S_RESCUE_SUCCESS;
                else if (rescue_fail)
                    next_state = S_GAME_OVER;
            end

            S_RESCUE_SUCCESS: begin
                if (btn_start)
                    next_state = S_NORMAL;
            end

            S_GAME_OVER: begin
                if (btn_restart)
                    next_state = S_CUSTOMIZE;
            end

            default: next_state = S_WELCOME;
        endcase
    end

    // Status Flag Outputs
    assign is_welcome    = (current_state == S_WELCOME);
    assign is_customize  = (current_state == S_CUSTOMIZE);
    assign is_normal     = (current_state == S_NORMAL);
    assign is_sleeping   = (current_state == S_SLEEP);
    assign is_icu_warn   = (current_state == S_ICU_WARN);
    assign is_icu_game   = (current_state == S_ICU_GAME);
    assign is_success    = (current_state == S_RESCUE_SUCCESS);
    assign is_game_over  = (current_state == S_GAME_OVER);

endmodule

