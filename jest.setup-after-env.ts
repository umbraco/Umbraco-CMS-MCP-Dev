// Snapshot serializer: normalize environment-specific values
// so snapshots are consistent across local dev (macOS) and CI (Linux).
// Also collapses the Umbraco project folder name to <PROJECT> so
// snapshots survive project renames.
const cwd = process.cwd();
const CWD_REGEX = new RegExp(cwd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
expect.addSnapshotSerializer({
  test: (val: unknown) => typeof val === 'string' && (
    CWD_REGEX.test(val) ||
    /\/(Users|home)\//.test(val) ||
    /\/(users|home)\//.test(val) ||
    /NIOFSDirectory|MMapDirectory/i.test(val) ||
    /\/demo-site\//i.test(val)
  ),
  serialize: (val: string, config, indentation, depth, refs, printer) => {
    let normalized = val
      .replace(CWD_REGEX, '<CWD>')
      .replace(/\/(Users|users)\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/\/home\/[^\s"',)]+/g, '<NORMALIZED_PATH>')
      .replace(/NIOFSDirectory|MMapDirectory/gi, 'NORMALIZED_FS_DIR')
      .replace(/\/demo-site\//gi, '/<PROJECT>/');
    return printer(normalized, config, indentation, depth, refs);
  },
});
