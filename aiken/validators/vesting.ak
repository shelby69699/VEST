use aiken/transaction.{ScriptContext, Spend}
use vesting/types.{VestingDatum}
use vodka_extra_signatories.{key_signed}
use vodka_validity_range.{valid_after}

//
//  A vesting validator locks funds for a beneficiary until a specified
//  timestamp.  Either the owner may spend the funds at any time, or the
//  beneficiary may spend them after the `lock_until` timestamp has passed.
//
validator {
  pub fn vesting(datum: VestingDatum, _redeemer: Data, ctx: ScriptContext) {
    // The validator should only be used for spending UTxOs.
    when ctx.purpose is {
      Spend(_) -> or {
        // Allow the owner to spend at any time.
        key_signed(ctx.transaction.extra_signatories, datum.owner),
        // Allow the beneficiary to spend after the lock period has passed.
        and {
          key_signed(ctx.transaction.extra_signatories, datum.beneficiary),
          valid_after(ctx.transaction.validity_range, datum.lock_until),
        },
      }
      _ -> False
    }
  }
}
