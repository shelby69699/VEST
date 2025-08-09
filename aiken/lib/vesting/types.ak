pub type VestingDatum {
  /// POSIX time in milliseconds, e.g. 1672843961000
  lock_until: Int,
  /// Owner's credentials (public key hash)
  owner: ByteArray,
  /// Beneficiary's credentials (public key hash)
  beneficiary: ByteArray,
}
