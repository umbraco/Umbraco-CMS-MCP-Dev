using Examine;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using UmbracoExamine.PDF;

namespace MySite.MyCustomIndex;

[ComposeAfter(typeof(ExaminePdfComposer))]
public class ExamineComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddExamineLuceneMultiSearcher("MultiSearcher", new[] {Constants.UmbracoIndexes.ExternalIndexName, PdfIndexConstants.PdfIndexName});
    }
}