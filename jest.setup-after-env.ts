// Snapshot serializer: normalize environment-specific values
// so snapshots are consistent across local dev (macOS) and CI (Linux)
const CWD_REGEX = new RegExp(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
expect.addSnapshotSerializer({
  test: (val: unknown) => typeof val === 'string' && (
    CWD_REGEX.test(val) ||
    /\/(Users|home)\//.test(val) ||
    /NIOFSDirectory|MMapDirectory/i.test(val)
  ),
  serialize: (val: string, config, indentation, depth, refs, printer) => {
    let normalized = val
      .replace(CWD_REGEX, '<CWD>')
      .replace(/\/Users\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/\/home\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/NIOFSDirectory|MMapDirectory/gi, 'NORMALIZED_FS_DIR');
    return printer(normalized, config, indentation, depth, refs);
  },
});
